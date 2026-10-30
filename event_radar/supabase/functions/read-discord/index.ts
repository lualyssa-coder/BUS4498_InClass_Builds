// Club Event Radar: the Discord reader (Supabase Edge Function "read-discord").
//
// It reads new messages from one Discord channel, sends each eligible message
// to submit-event, and replies with the agent's decision. The Discord token and
// channel ID are Supabase Edge Function Secrets, never repository files.

import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const SOURCE = "discord";
const DISCORD_API = "https://discord.com/api/v10";
const MAX_MESSAGES = 20;
const MAX_THREAD = 4;
const THREAD_WINDOW_MS = 10 * 60 * 1000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type DiscordMessage = {
  id: string;
  type?: number;
  content?: string;
  timestamp?: string;
  author?: { id?: string; bot?: boolean; username?: string; global_name?: string | null };
};

type Cursor = { source: string; last_id: string; read_count: number };

class ReaderError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function serverKey(): string {
  const keys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (keys) {
    try {
      const key = JSON.parse(keys)["default"];
      if (key) return key;
    } catch (_) {
      // Fall back to the legacy key below.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

function token(): string {
  return Deno.env.get("DISCORD_BOT_TOKEN") ?? "";
}

function channelId(): string {
  return Deno.env.get("DISCORD_CHANNEL_ID") ?? "";
}

function db() {
  return createClient(Deno.env.get("SUPABASE_URL")!, serverKey(), {
    auth: { persistSession: false },
  });
}

function newerId(a: string, b: string): string {
  if (!a) return b;
  if (!b) return a;
  try {
    return BigInt(a) >= BigInt(b) ? a : b;
  } catch (_) {
    return a.length >= b.length && a >= b ? a : b;
  }
}

function messageName(message: DiscordMessage): string {
  return message.author?.global_name || message.author?.username || "Discord user";
}

function submitApiKey(request: Request): string {
  return request.headers.get("apikey")
    ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")
    ?? Deno.env.get("SUPABASE_ANON_KEY")
    ?? "";
}

function eligible(message: DiscordMessage): boolean {
  return Boolean(message.content?.trim()) && message.author?.bot !== true && (message.type ?? 0) === 0;
}

function discordHeaders() {
  return {
    Authorization: `Bot ${token()}`,
    "Content-Type": "application/json",
  };
}

async function discordFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${DISCORD_API}${path}`, {
    ...init,
    headers: { ...discordHeaders(), ...(init.headers ?? {}) },
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error("Discord API error", response.status, detail.slice(0, 500));
    throw new ReaderError(`Discord returned HTTP ${response.status}.`, response.status === 401 ? 502 : 502);
  }
  return response;
}

async function listMessages(after = "", before = ""): Promise<DiscordMessage[]> {
  const params = new URLSearchParams({ limit: String(MAX_MESSAGES) });
  if (after) params.set("after", after);
  if (before) params.set("before", before);
  const response = await discordFetch(`/channels/${encodeURIComponent(channelId())}/messages?${params}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new ReaderError("Discord returned an unexpected message list.", 502);
  return data as DiscordMessage[];
}

async function getCursor(): Promise<Cursor> {
  const { data, error } = await db()
    .from("channel_cursor")
    .select("source, last_id, read_count")
    .eq("source", SOURCE)
    .maybeSingle();
  if (error) throw new ReaderError("The channel cursor could not be read.", 500);
  return data ?? { source: SOURCE, last_id: "", read_count: 0 };
}

async function saveCursor(lastId: string, readCount: number): Promise<void> {
  const { error } = await db().from("channel_cursor").upsert({
    source: SOURCE,
    last_id: lastId,
    read_count: readCount,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new ReaderError("The channel cursor could not be saved.", 500);
}

async function senderThread(message: DiscordMessage): Promise<string[]> {
  const authorId = message.author?.id;
  const messageTime = Date.parse(message.timestamp ?? "");
  if (!authorId || !Number.isFinite(messageTime)) return [];

  const earlier = await listMessages("", message.id);
  return earlier
    .filter((candidate) =>
      eligible(candidate) &&
      candidate.author?.id === authorId &&
      Number.isFinite(Date.parse(candidate.timestamp ?? "")) &&
      messageTime - Date.parse(candidate.timestamp ?? "") <= THREAD_WINDOW_MS &&
      messageTime > Date.parse(candidate.timestamp ?? "")
    )
    .sort((a, b) => Date.parse(a.timestamp ?? "") - Date.parse(b.timestamp ?? ""))
    .slice(-MAX_THREAD)
    .map((candidate) => candidate.content!.trim().slice(0, 500));
}

async function postDecision(text: string): Promise<void> {
  const response = await discordFetch(`/channels/${encodeURIComponent(channelId())}/messages`, {
    method: "POST",
    body: JSON.stringify({ content: text.slice(0, 2000) }),
  });
  await response.body?.cancel();
}

function decisionText(result: Record<string, unknown>): string {
  const message = String(result.message ?? "The agent returned no message.");
  const reasons = Array.isArray(result.reasons) ? result.reasons.map(String) : [];
  return reasons.length ? `${message}\n${reasons.map((reason) => `• ${reason}`).join("\n")}` : message;
}

async function checkDiscord(): Promise<Record<string, unknown>> {
  if (!token() || !channelId()) return { ok: true, ready: false, bot: false, channel: false, message: "Add the Discord secrets first." };
  try {
    const botResponse = await discordFetch("/users/@me");
    const bot = await botResponse.json();
    const channelResponse = await discordFetch(`/channels/${encodeURIComponent(channelId())}`);
    const channel = await channelResponse.json();
    return {
      ok: true,
      ready: true,
      bot: Boolean(bot?.bot),
      channel: Boolean(channel?.id),
      message: "The Discord bot token and channel are working.",
    };
  } catch (_) {
    return { ok: true, ready: false, bot: false, channel: false, message: "Discord could not verify the bot token or channel." };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    if (req.method === "GET") {
      if (new URL(req.url).searchParams.get("check") === "discord") return reply(200, await checkDiscord());
      const cursor = await getCursor();
      return reply(200, {
        ok: true,
        ready: Boolean(token() && channelId()),
        last_message_id: cursor.last_id,
        read_count: cursor.read_count,
        bot: Boolean(token()),
      });
    }
    if (req.method !== "POST") return reply(405, { ok: false, message: "Send a POST request." });
    if (!token() || !channelId()) throw new ReaderError("Add DISCORD_BOT_TOKEN and DISCORD_CHANNEL_ID in Supabase Edge Function Secrets.", 503);

    const cursor = await getCursor();
    const messages = await listMessages(cursor.last_id);
    if (!messages.length) return reply(200, { ok: true, read: 0, last_message_id: cursor.last_id });

    const newest = messages.reduce((latest, message) => newerId(latest, message.id), cursor.last_id);
    if (!cursor.last_id) {
      await saveCursor(newest, cursor.read_count);
      return reply(200, { ok: true, initialized: true, read: 0, last_message_id: newest });
    }

    const ordered = [...messages].sort((a, b) => (newerId(a.id, b.id) === a.id ? 1 : -1));
    const apiKey = submitApiKey(req);
    for (const message of ordered) {
      if (!eligible(message)) continue;
      const thread = await senderThread(message);
      const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/submit-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: apiKey },
        body: JSON.stringify({
          announcement: message.content!.trim(),
          source: SOURCE,
          source_id: message.id,
          source_name: messageName(message),
          thread,
        }),
      });
      const result = await response.json();
      if (result.already_read === true) continue;
      await postDecision(decisionText(result));
    }

    const newCount = cursor.read_count + messages.length;
    await saveCursor(newest, newCount);
    return reply(200, { ok: true, read: messages.length, last_message_id: newest, read_count: newCount });
  } catch (err) {
    if (err instanceof ReaderError) return reply(err.status, { ok: false, message: err.message });
    console.error(err);
    return reply(500, { ok: false, message: "Something went wrong in the Discord reader. Check the function logs." });
  }
});

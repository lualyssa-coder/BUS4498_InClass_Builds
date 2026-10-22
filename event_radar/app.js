(() => {
  "use strict";

  const config = window.EVENT_RADAR_CONFIG || {};
  const state = {
    events: [],
    filter: "all",
  };
  const MAX_FLYER_SIZE = 5 * 1024 * 1024;
  const FLYER_TYPES = new Set(["image/jpeg", "image/png"]);

  const columns = [
    "id",
    "created_at",
    "status",
    "title",
    "club",
    "event_date",
    "start_time",
    "end_time",
    "place_name",
    "place_detail",
    "cost",
    "free_food",
    "summary",
    "flyer_url",
  ].join(", ");
  const moderatorColumns = [
    columns,
    "announcement",
    "status_reason",
    "note_for_moderator",
  ].join(", ");

  let supabaseClient = null;
  let moderatorSession = null;

  const elements = {};

  function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function setBoardStatus(message) {
    elements.boardStatus.textContent = message;
  }

  function setResult(kind, label, message, reasons = []) {
    const result = elements.postResult;
    result.hidden = false;
    result.className = `result ${kind}`;
    result.replaceChildren();

    result.append(makeElement("p", "result-label", label));
    result.append(makeElement("p", "result-message", message));

    if (reasons.length > 0) {
      const list = makeElement("ul", "reasons");
      for (const reason of reasons) {
        list.append(makeElement("li", "", reason));
      }
      result.append(list);
    }
  }

  function setModeratorStatus(kind, label, message) {
    const result = elements.moderatorStatus;
    result.hidden = false;
    result.className = `result ${kind}`;
    result.replaceChildren();
    result.append(makeElement("p", "result-label", label));
    result.append(makeElement("p", "result-message", message));
  }

  function formatDate(dateValue) {
    if (!dateValue) return null;
    const match = String(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    if (Number.isNaN(date.getTime())) return null;
    return {
      month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
      day: new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(date),
      full: new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(date),
    };
  }

  function formatTime(timeValue) {
    if (!timeValue) return "";
    const match = String(timeValue).match(/^(\d{1,2}):(\d{2})/);
    if (!match) return "";
    const date = new Date(2000, 0, 1, Number(match[1]), Number(match[2]));
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  function formatWhen(event) {
    const date = formatDate(event.event_date);
    const start = formatTime(event.start_time);
    const end = formatTime(event.end_time);
    const time = start && end ? `${start} to ${end}` : start || end;

    if (date && time) return `${date.full} · ${time}`;
    if (date) return `${date.full} · Time to be announced`;
    if (time) return `Date to be announced · ${time}`;
    return "Date and time to be announced";
  }

  function eventMatchesFilter(event) {
    if (state.filter === "food") return event.free_food === true;
    if (state.filter === "online") {
      return String(event.place_name || "").toLowerCase() === "online";
    }
    return true;
  }

  function createEventCard(event) {
    const item = makeElement("li", "event");
    const date = formatDate(event.event_date);

    if (date) {
      const dateBox = makeElement("div", "date");
      dateBox.append(makeElement("span", "mon", date.month));
      dateBox.append(makeElement("span", "day", date.day));
      item.append(dateBox);
    } else {
      const dateBox = makeElement("div", "date tba");
      dateBox.append(makeElement("span", "day", "TBA"));
      item.append(dateBox);
    }

    const body = makeElement("div", "event-body");
    body.append(makeElement("p", "when", formatWhen(event)));
    body.append(makeElement("h3", "", event.title || "Campus event"));

    const location = [event.place_name, event.place_detail].filter(Boolean).join(" · ");
    const meta = [event.club, location].filter(Boolean).join(" · ");
    if (meta) body.append(makeElement("p", "meta", meta));
    if (event.summary) body.append(makeElement("p", "summary", event.summary));

    const tags = makeElement("p", "tags");
    if (event.cost) tags.append(makeElement("span", "tag", event.cost));
    if (event.free_food === true) {
      tags.append(makeElement("span", "tag food", "🍕 Free food"));
    }
    if (tags.childElementCount > 0) body.append(tags);

    item.append(body);

    if (isProjectFlyerUrl(event.flyer_url)) {
      const flyer = makeElement("img", "flyer");
      flyer.src = event.flyer_url;
      flyer.alt = `${event.title || "Event"} flyer`;
      flyer.loading = "lazy";
      flyer.decoding = "async";
      item.append(flyer);
    }

    return item;
  }

  function createReviewCard(event) {
    const item = createEventCard(event);
    const review = makeElement("div", "review");
    review.append(makeElement("p", "why", event.status_reason || "Waiting for review."));
    review.append(makeElement("p", "original", event.announcement || "No original announcement was saved."));

    const actions = makeElement("p", "actions");
    const approveButton = makeElement("button", "", "Approve");
    const rejectButton = makeElement("button", "ghost", "Reject");

    approveButton.addEventListener("click", () => reviewEvent(event, "published", approveButton, rejectButton));
    rejectButton.addEventListener("click", () => reviewEvent(event, "rejected", approveButton, rejectButton));

    actions.append(approveButton, rejectButton);
    review.append(actions);
    item.querySelector(".event-body").append(review);
    return item;
  }

  function isProjectFlyerUrl(value) {
    if (!value || !config.supabaseUrl) return false;
    try {
      const imageUrl = new URL(value);
      const projectUrl = new URL(config.supabaseUrl);
      return imageUrl.protocol === "https:" &&
        imageUrl.origin === projectUrl.origin &&
        imageUrl.pathname.startsWith("/storage/v1/object/public/flyers/");
    } catch {
      return false;
    }
  }

  function renderEvents(emptyMessage = "No published events yet. Post the first one!") {
    const board = elements.eventBoard;
    board.replaceChildren();
    const visibleEvents = state.events.filter(eventMatchesFilter);

    if (visibleEvents.length === 0) {
      board.append(makeElement("li", "empty", emptyMessage));
      return;
    }

    for (const event of visibleEvents) board.append(createEventCard(event));
  }

  async function loadEvents() {
    if (!supabaseClient) {
      setBoardStatus("The website is not connected to Supabase yet.");
      renderEvents("Events are unavailable until the website is configured.");
      return;
    }

    elements.refreshEvents.disabled = true;
    setBoardStatus("Loading events…");

    const { data, error } = await supabaseClient
      .from("events")
      .select(columns)
      .eq("status", "published")
      .order("event_date", { ascending: true, nullsFirst: false })
      .order("start_time", { ascending: true, nullsFirst: false });

    elements.refreshEvents.disabled = false;

    if (error) {
      console.error("Could not load events", error);
      setBoardStatus("Could not load events right now.");
      renderEvents("Events are temporarily unavailable.");
      return;
    }

    state.events = data || [];
    setBoardStatus(state.events.length === 1 ? "1 published event" : `${state.events.length} published events`);
    renderEvents();
  }

  async function loadWaitingEvents() {
    if (!supabaseClient || !moderatorSession) return;

    const { data, error } = await supabaseClient
      .from("events")
      .select(moderatorColumns)
      .eq("status", "waiting")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Could not load waiting events", error);
      setModeratorStatus("error", "Could not load reviews", "The waiting posts could not be loaded.");
      elements.waitingBoard.replaceChildren();
      return;
    }

    elements.waitingBoard.replaceChildren();
    const waitingEvents = data || [];
    if (waitingEvents.length === 0) {
      elements.waitingBoard.append(makeElement("li", "empty", "No posts are waiting for review."));
      return;
    }

    for (const event of waitingEvents) {
      elements.waitingBoard.append(createReviewCard(event));
    }
  }

  async function reviewEvent(event, status, approveButton, rejectButton) {
    approveButton.disabled = true;
    rejectButton.disabled = true;

    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData.user) {
      setModeratorStatus("error", "Sign-in expired", "Sign in again before reviewing posts.");
      approveButton.disabled = false;
      rejectButton.disabled = false;
      return;
    }

    const statusReason = status === "published"
      ? "Approved by moderator."
      : "Rejected by moderator.";
    const { error } = await supabaseClient
      .from("events")
      .update({
        status,
        status_reason: statusReason,
        reviewed_at: new Date().toISOString(),
        reviewed_by: userData.user.id,
      })
      .eq("id", event.id)
      .eq("status", "waiting");

    if (error) {
      console.error("Could not review event", error);
      setModeratorStatus("error", "Review failed", "The post could not be updated.");
      approveButton.disabled = false;
      rejectButton.disabled = false;
      return;
    }

    setModeratorStatus(
      status === "published" ? "published" : "rejected",
      status === "published" ? "Approved" : "Rejected",
      status === "published" ? "The event is now on the public website." : "The event will not appear on the public website.",
    );
    await loadWaitingEvents();
    await loadEvents();
  }

  function showModeratorSignedOut() {
    elements.moderatorSignedOut.hidden = false;
    elements.moderatorSignedIn.hidden = true;
    elements.moderatorUser.textContent = "";
    elements.waitingBoard.replaceChildren();
  }

  async function showModeratorSignedIn(session) {
    moderatorSession = session;
    elements.moderatorSignedOut.hidden = true;
    elements.moderatorSignedIn.hidden = false;
    elements.moderatorUser.textContent = session.user.email || "Signed in moderator";
    await loadWaitingEvents();
  }

  async function signInModerator(event) {
    event.preventDefault();
    const email = elements.moderatorEmail.value.trim();
    const password = elements.moderatorPassword.value;

    if (!email || !password) {
      setModeratorStatus("error", "Add your sign-in", "Enter your moderator email and password.");
      return;
    }

    elements.moderatorSignin.disabled = true;
    setModeratorStatus("waiting", "Signing in…", "Checking your moderator account.");

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    elements.moderatorSignin.disabled = false;

    if (error || !data?.session) {
      console.error("Could not sign in moderator", error);
      setModeratorStatus(
        "error",
        "Sign-in failed",
        error?.message || "Supabase did not return a signed-in session.",
      );
      return;
    }

    elements.moderatorPassword.value = "";
    await showModeratorSignedIn(data.session);
  }

  async function signOutModerator() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error("Could not sign out moderator", error);
      setModeratorStatus("error", "Sign-out failed", "Try signing out again.");
      return;
    }

    moderatorSession = null;
    showModeratorSignedOut();
  }

  async function initModerator() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
      console.error("Could not check moderator session", error);
      showModeratorSignedOut();
      return;
    }

    if (data.session) {
      await showModeratorSignedIn(data.session);
    } else {
      showModeratorSignedOut();
    }

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      moderatorSession = session;
      if (!session) {
        showModeratorSignedOut();
        return;
      }

      window.setTimeout(() => showModeratorSignedIn(session), 0);
    });
  }

  async function submitAnnouncement(event) {
    event.preventDefault();
    const announcement = elements.announcement.value.trim();

    if (!announcement) {
      setResult("error", "Add an announcement", "Paste the club announcement before submitting it.");
      elements.announcement.focus();
      return;
    }

    const flyer = elements.flyer.files[0] || null;
    if (flyer && (!FLYER_TYPES.has(flyer.type) || flyer.size < 1 || flyer.size > MAX_FLYER_SIZE)) {
      setResult("error", "Check the flyer", "Choose a JPG or PNG flyer no larger than 5 MB.");
      return;
    }

    if (!config.supabaseUrl || !config.publishableKey) {
      setResult("error", "Website not configured", "The Supabase Project URL or publishable key is missing.");
      return;
    }

    const submitButton = elements.submitPost;
    submitButton.disabled = true;
    setResult("waiting", "Checking…", "The event agent is reviewing this announcement.");

    const formData = new FormData();
    formData.append("announcement", announcement);
    if (flyer) formData.append("flyer", flyer, flyer.name);

    try {
      const response = await fetch(`${config.supabaseUrl}/functions/v1/submit-event`, {
        method: "POST",
        headers: {
          apikey: config.publishableKey,
        },
        body: formData,
      });

      let payload;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload) {
        setResult("error", "Couldn’t reach the agent", "The event agent returned an unexpected response.");
        return;
      }

      const status = payload.status || (payload.ok ? "published" : "error");
      const labels = {
        published: "Published",
        waiting: "Waiting for review",
        rejected: "Not posted",
        duplicate: "Already posted",
        error: "Could not post",
      };
      const kind = ["published", "waiting", "rejected", "duplicate"].includes(status)
        ? status
        : "error";
      const message = payload.message || "The agent finished without a message.";
      const reasons = Array.isArray(payload.reasons) ? payload.reasons : [];
      setResult(kind, labels[status] || labels.error, message, reasons);

      if (payload.ok && status === "published") {
        elements.postForm.reset();
        await loadEvents();
      }
    } catch (error) {
      console.error("Could not reach event agent", error);
      setResult(
        "error",
        "Couldn’t reach the agent",
        "Check that the submit-event function is deployed and Verify JWT is off.",
      );
    } finally {
      submitButton.disabled = false;
    }
  }

  function setFilter(filter) {
    state.filter = filter;
    for (const button of elements.filterButtons) {
      button.setAttribute("aria-pressed", button.dataset.filter === filter ? "true" : "false");
    }
    renderEvents();
  }

  function init() {
    elements.postForm = document.getElementById("post-form");
    elements.announcement = document.getElementById("announcement");
    elements.flyer = document.getElementById("flyer");
    elements.submitPost = document.getElementById("submit-post");
    elements.postResult = document.getElementById("post-result");
    elements.refreshEvents = document.getElementById("refresh-events");
    elements.boardStatus = document.getElementById("board-status");
    elements.eventBoard = document.getElementById("event-board");
    elements.filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
    elements.moderatorSignedOut = document.getElementById("moderator-signed-out");
    elements.moderatorSignedIn = document.getElementById("moderator-signed-in");
    elements.moderatorSigninForm = document.getElementById("moderator-signin-form");
    elements.moderatorEmail = document.getElementById("moderator-email");
    elements.moderatorPassword = document.getElementById("moderator-password");
    elements.moderatorSignin = document.getElementById("moderator-signin");
    elements.moderatorSignout = document.getElementById("moderator-signout");
    elements.moderatorStatus = document.getElementById("moderator-status");
    elements.moderatorUser = document.getElementById("moderator-user");
    elements.waitingBoard = document.getElementById("waiting-board");

    elements.postForm.addEventListener("submit", submitAnnouncement);
    elements.refreshEvents.addEventListener("click", loadEvents);
    elements.moderatorSigninForm.addEventListener("submit", signInModerator);
    elements.moderatorSignout.addEventListener("click", signOutModerator);
    for (const button of elements.filterButtons) {
      button.addEventListener("click", () => setFilter(button.dataset.filter || "all"));
    }

    try {
      if (!window.supabase || !config.supabaseUrl || !config.publishableKey) {
        throw new Error("Supabase configuration is missing.");
      }
      supabaseClient = window.supabase.createClient(config.supabaseUrl, config.publishableKey);
    } catch (error) {
      console.error("Could not connect to Supabase", error);
      setBoardStatus("The website is not configured yet.");
      renderEvents("Events are unavailable until the website is configured.");
      return;
    }

    loadEvents();
    initModerator();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

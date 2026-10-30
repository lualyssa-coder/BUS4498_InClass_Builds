# Club Event Radar

A BUS 4498 practice build (Week 9, Friday Build 3, and Week 10). Club officers paste an announcement, an AI agent turns it into an event card and checks the posting rules, and the post is either published or held for a moderator. From Week 10, the agent looks things up before it decides: the club list, the club's earlier posts, and the lessons moderators wrote.

## How it's hosted

| Part | What it does | Here |
|---|---|---|
| GitHub repository | Holds the code | This folder |
| GitHub Pages | Serves the public website | `index.html`, `style.css`, `app.js`, `config.js` |
| Supabase project | The backend | The database, the AI agent, the photos, the sign-in |
| Database table | Saves every post and its status | `events` |
| Edge Function | The AI agent | `supabase/functions/submit-event` |
| Secrets | Hold the AI key, which is never in this repository | Set in Supabase |
| Storage | Keeps flyer photos | The `flyers` bucket |
| Sign-in | Moderator accounts | Supabase Auth |

## What the agent knows and remembers (Week 10)

| | Where it lives | Who changes it | How the agent uses it |
|---|---|---|---|
| **Knowledge:** the posting rules and campus places | `context/`, copied into the agent | The builders, by redeploying | Read on every post |
| **Knowledge:** the club list | The `clubs` table | Moderators, in the Table Editor | Read on every post; a nickname becomes the official name, an unknown club waits |
| **Memory of what happened:** every post and its status | The `events` table | The agent, as it works | An update replaces the club's earlier post instead of adding a second one |
| **Lessons:** what moderators taught it | The `lessons` table | Signed-in moderators, on the website; each has an on/off switch | Read on every post; a lesson can make a post wait, never publish one |
| **What it looked at** | `agent_notes` on each post | The agent | Shown to the poster and the moderator |

## Files

- `context/`: the posting rules, campus places, and what the club list holds (stable context).
- `test/`: sample posts, what should happen, and the test logs.
- `supabase/migrations/`: the database changes, one per stage.
- `supabase/functions/read-channel/`: the chat-channel reader (Stage 14, optional).
- `AGENTS.md` and `CLAUDE.md`: instructions for Claude Code and Codex.
- `HANDOFF.md`: handoff notes for a teammate.

Every club, event, and person in the sample posts is made up.

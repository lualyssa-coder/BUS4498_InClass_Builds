# Club Event Radar

A BUS 4498 practice build (Week 9, Friday Build 3). Club officers paste an announcement, an AI agent turns it into an event card and checks the posting rules, and the post is either published or held for a moderator.

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

## Files

- `context/`: the posting rules and campus places (stable context).
- `test/`: sample posts, what should happen, and the test log.
- `supabase/migrations/`: the database changes, one per stage.
- `AGENTS.md` and `CLAUDE.md`: instructions for Claude Code and Codex.
- `HANDOFF.md`: handoff notes for a teammate.

Every club, event, and person in the sample posts is made up.

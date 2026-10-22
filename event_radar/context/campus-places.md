# Campus places

The AI agent matches each post's place to one of these codes. A place that is clearly off campus becomes `OFF_CAMPUS` and waits for a moderator (rule R3). If a post doesn't say where, the place stays empty and the post waits (rule R2).

The same list is in `supabase/functions/submit-event/index.ts`. Change both together.

| Code | Shown on the website as |
|---|---|
| `UU` | University Union (UU) |
| `UU-PLAZA` | UU Plaza |
| `CHUMASH` | Chumash Auditorium |
| `DEXTER-LAWN` | Dexter Lawn |
| `LIBRARY` | Kennedy Library |
| `BUSINESS` | Orfalea College of Business building |
| `REC-CENTER` | Recreation Center |
| `MOTT` | Mott Athletics Center |
| `SPANOS` | Spanos Theatre |
| `ONLINE` | Online |

Room numbers and other details go in the card's place detail, such as "Room 220".

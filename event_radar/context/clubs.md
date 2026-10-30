# The club list

The club list is **knowledge** the agent reads on every post: facts that stay the same from post to post, kept where a person can change them without touching the code.

It lives in the `clubs` table in Supabase (**Table Editor → clubs**), not in this file, because moderators update it and the agent should see the change on the very next post, with nothing redeployed. This file explains the table.

| Column | What it holds | Example |
|---|---|---|
| `name` | The official club name. The agent writes this on the card. | `Board Game Guild` |
| `nicknames` | Other names the club goes by, separated by commas. A nickname in a post means this club. | `BGG, board game club` |
| `usual_place_code` | Where the club usually meets, as a code from `campus-places.md`. **A hint for the moderator only**: the agent never fills a missing place from it (rule R2 stands). | `UU` |
| `usual_place_detail` | Room or other detail for the usual place. | `Room 220` |
| `active` | Switch a club off instead of deleting it. | `true` |
| `note` | Anything a moderator wants to remember about the club. | |

What the agent does with it:

- A post from a listed club (by name or nickname) gets the official name on its card.
- A post from a club that isn't on the list **waits for a moderator**, who can add the club in the Table Editor. The next post from that club then goes through.
- A post with no place, from a club with a usual place, still waits (rule R2). The reason shown to the club and the moderator includes the usual place as a hint.

The list starts with six made-up clubs: Board Game Guild, Mustang Pitch Society, Women in Finance Circle, Sustainability Crew, Accounting Society, and Cal Poly Ski & Snowboard Club (see `supabase/migrations/20261030001100_club_list.sql`).

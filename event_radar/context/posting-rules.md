# Posting rules for Club Event Radar

These rules are the website's **stable context**: they stay the same from post to post. The AI agent reads them every time. They are copied into `supabase/functions/submit-event/index.ts`, so if you change a rule here, change it there too.

Who decides what:

- **The AI agent** reads each post, fills in the event card, and flags rule problems.
- **The code** decides the status. A post is published only when nothing is flagged.
- **The database** refuses a second live post with the same date, start time, and place.
- **A moderator** decides every post that waits.

## The rules

R1. Events only: something students can attend, such as a meeting, workshop, social, game, talk, or performance. Not a sale, a lost item, a ride share, housing, or an ad.

R2. Every post needs a date, a start time, and a place. If any of them is missing, the post waits and the club is asked to add it.

R3. On campus or online only. A post for an off-campus place waits for a moderator.

R4. No alcohol, cannabis, or gambling. A post that mentions them waits for a moderator.

R5. When a post gives a cost, show it as "Free" or the price. A payment link to a personal account (Venmo, Cash App, Zelle) waits for a moderator.

R6. Privacy: no personal phone numbers, personal email addresses, or payment handles on the website. Leave them out of the card and tell the moderator.

R7. Tag free food only when the post clearly says food is provided for free.

R8. The event must be today or within the next 60 days. Anything else waits for a moderator.

R9. A post with a photo always waits for a moderator before it appears on the website.

*Practice rules for BUS 4498. They are not Cal Poly or ASI policy.*

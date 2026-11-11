# Block recipes

Realistic, self-contained product blocks. Each one names the generic component types it uses, so map them to whatever the project's library offers. If the library lacks a type, leave it out or use plain HTML styled with tokens. Don't fake a component the library doesn't have, and say so in the report.

Use invented, neutral content: "John Doe", "Jane Smith", "Acme Ltd", plausible dates and amounts. Never lorem ipsum, and never the user's own name.

## Identity and access

**Sign up.** Title "Create an account", description "Start your 14-day trial. No card needed." Contains two social buttons (outlined, with icons), an "or continue with" hairline divider, an email input, a password input with supporting text, a terms checkbox, and a full-width primary button.

**Invite teammates.** Title "Your team", description "Invite and manage who can see this project." Contains an email input with an "Invite" button on the same row, then 3–5 member rows: avatar or initials, name, email in muted ink, and a role (badge or select).

**Account security.** Title "Security". Contains a switch row "Two-factor authentication" with a description, a list row "Active sessions · 3" with a chevron, and a destructive text button "Sign out everywhere".

## Settings

**Notification preferences.** Title "Notifications", description "Choose what you hear about." Contains 3 rows, each with a label, a one-line description, and either a switch or a set of channel checkboxes (Email, Push, Slack), then a secondary "Save preferences" button.

**Appearance.** Contains a radio group or chips for theme and density, a small preview, and Save.

## Data and status

**KPI strip.** One block with 3–4 metrics separated by vertical hairlines. Each metric has a label, a big number, and a delta badge (success for up, error for down) with "vs last month".

**Activity feed.** Title "Recent activity". Contains 4–6 rows with an avatar or icon, "**Jane Smith** approved invoice #3461", and a relative time on the right. A link at the bottom says "View all".

**Progress or goal.** Title "Quarterly goal", description "€42,000 of €60,000". Contains a progress bar (or a styled `<progress>`), a status badge "On track", and a secondary button.

**Table excerpt.** 4–5 rows with checkbox, name, status badge, amount (right-aligned, tabular numbers) and a row action. Pagination goes underneath.

## Commerce

**Payment method.** Title "Payment method". Contains 3 selectable tiles (Card, PayPal, Bank), cardholder and number inputs, and month, year and CVC on one row. A full-width primary button says "Continue".

**Plan picker.** A radio group of plans with price and a short feature line, a monthly/yearly switch, and a primary button. Keep it to one block, not a pricing section.

**Receipt or success.** A success icon, a title "Payment received", the amount in large type, the recipient email in muted ink, and two buttons (Download, Done).

## Productivity

**Profile header.** Avatar, name, role and location, a status badge ("Available"), line tabs (Overview, Experience, Documents), then skill chips and a primary action.

**Calendar booking.** A calendar next to a list of time slots (chips or radio), plus a "Book 30 min" button.

**File upload.** A dashed drop zone with an icon and "Drop files or browse", then 2 file rows with name, size, a progress or done state, and remove.

**Composer or chat.** A greeting, a textarea with attach and send icon buttons, and suggestion chips.

**Issue report.** Title input, a select for area, a textarea, severity as a radio or chips, and Submit.

## Choosing blocks for a page

- **Frontpage wall:** 6–10 blocks that together use most of the library. Mix tall and short ones, and include at least one form, one list, one settings block and one status block.
- **Dashboard:** a headline metrics band (not four boxed KPI cards), the main working surface (a table, pipeline or chart), and secondary context such as activity in a quieter, unboxed column. See archetype 5c.
- **Settings page:** flat sections divided by hairlines (archetype 5d), with the intro on the left and controls on the right. Use blocks only for things that really are separate objects, such as a list of sessions. Never put settings in a grid, and avoid a stack of identical boxed cards.
- **Gallery or catalog:** no blocks. Use spec-sheet cells with one component each.

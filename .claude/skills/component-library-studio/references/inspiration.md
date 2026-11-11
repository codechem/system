# What the best component-library sites do

These notes come from studying radix-ui.com, ui.shadcn.com, park-ui.com and kokonutui.com in a real browser (November 2026). Use them as a vocabulary, not as templates to copy.

## Radix UI (radix-ui.com)

- **Hero:** split layout. On the left: a small announcement pill, a large **serif** display headline ("Start building your app now"), a two-line lede, a short code snippet in a dark panel, and two big buttons (a light primary and a tinted "Playground").
- **The wall:** on the right is a masonry of realistic app blocks: "Your team" (member list with avatars and an invite field), "Sign up", "Your company card", "Financial performance" (KPIs with delta badges), "Notifications" (rows of switches), "Recent activity" and "Invoice paid". The wall runs off the right edge and scrolls on its own.
- **Colour:** dark plum-to-black canvas, near-black blocks with 1px hairline borders, and indigo as the single accent (primary buttons, switches, links). Status colour appears only in badges.
- **Navigation:** logo on the left, centered pill tabs (Themes, Primitives, Icons, Colors), and on the right Documentation, Playground, Blog, GitHub and a theme toggle.
- **Lesson:** a wall of realistic blocks *is* the product pitch.

## shadcn/ui (ui.shadcn.com)

- **Hero:** centered. A small pill ("Trace, Code Block and AI Elements →"), a medium-weight headline ("The Foundation for your Design System"), two lines of lede, and two small buttons (filled light and outline dark).
- **The wall:** right under the hero, a 5-column masonry of examples: a component sampler, a bar chart, "Set a new milestone" (form), a QR "Scan to connect", "Distribute track", side menus, "Savings targets" (progress), "Q2 Dividend Income", "Account access", a chat composer, notification checkboxes, and breadcrumbs with a list of settings rows.
- **Colour:** strictly monochrome: black canvas, #111-ish blocks with a 16px radius, and white as the primary button. The only colour is a tiny yellow status dot. The bottom of the wall fades into the canvas with a mask.
- **Navigation:** a row of text links on the left (Docs, Components, Blocks, Charts…), a search field, GitHub stars, a theme toggle and a "+ New" button on the right.
- **Lesson:** restraint. With no accent at all, the components and the content carry the page.

## Park UI (park-ui.com)

- **Hero:** split. A pill ("Park UI × Chakra — It's official!"), a bold geometric sans headline ("Build your own Design System"), a lede, then "Get Started →" (white) and "Make it yours" (outline, opens theming), with framework logos underneath (React, Solid).
- **The wall:** blocks **rotated by about -4°** on the right, bleeding off the edges: Sign up (social buttons, email and password), Payment method (selectable option tiles), Share document (link field and a member list with role selects), Notifications (switch rows), a product card ("New Balance 574", rating, size picker) and Report an issue (form).
- **Colour:** monochrome dark, hairline borders, and white primary buttons. Theme colour is something you opt into ("Make it yours"), not the default.
- **Navigation:** minimal. Logo, a search field with ⌘K, Docs, Blog and Changelog divided by hairlines, then icons.
- **Lesson:** a slight tilt plus edge-bleed makes a static wall feel alive without any motion.

## Kokonut UI (kokonutui.com)

- **Structure:** everything sits inside a **hairline-ruled frame**, like a spec sheet. Even the hero is a grid of cells with small mono labels at the top (Kokonut UI · Component catalog · React, Tailwind CSS, Motion · Free and open source).
- **Hero:** a huge, tight grotesk headline ("Components that feel right."), a short lede, a "Browse 116 components" pill and a ⌘K search. On the right, two live demo cells (an activity-rings card and a "slide to pay" control).
- **Catalog cells:** each one has a mono code at top left (AI-01, IN-05), a hint at top right ("Turn it, or flick and let it coast"), a centered live demo, and a footer with the name, its dependencies in mono, and "Agent" and "Copy" buttons.
- **Colour:** pure black with 1px grey rules. The only loud colour is a pink promo bar, plus green mono codes.
- **Sections** are numbered (01 / Animated React components). This works here because it really is a catalog.
- **Lesson:** a ruled grid with consistent cell anatomy makes a large catalog scannable and reads as precise.

## Patterns shared by all four

1. Components appear in **realistic context** with real copy: names, amounts, dates and states.
2. **Neutral page chrome** with one accent at most. Colour comes from the components and their states.
3. **One surface level** for blocks, with a 1px hairline border and a 12–16px radius. No nested cards, no heavy shadows, no glows.
4. **Navigation is short:** 3–5 primary links, plus search, GitHub and theme. The header is never busy.
5. **Copy affordances everywhere:** an install command pill, "Copy" on every demo, and code next to the live result.
6. **The headline is short** (4–7 words) and set big. The lede is two lines.
7. **The wall** (masonry, tilted or ruled) does the visual work, so the hero copy can stay small.

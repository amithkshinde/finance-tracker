---
name: Finance Tracker
description: Quiet ledger. A calm, trustworthy net-worth tracker for one person in India (INR), macOS first, iOS later.
colors:
  light:
    background: "#F7F5F0"
    surface: "#FFFFFF"
    surface-sunken: "#EFECE5"
    border: "#E2DED4"
    ink: "#1B1F23"
    ink-muted: "#5E656C"
    accent: "#34527A"
    accent-soft: "#E4EAF2"
    gain: "#2E7D5B"
    loss: "#B4443C"
    stale-amber: "#B7791F"
    stale-red: "#B4443C"
  dark:
    background: "#14171A"
    surface: "#1C2024"
    surface-sunken: "#101316"
    border: "#2A2F35"
    ink: "#ECE9E2"
    ink-muted: "#9AA1A8"
    accent: "#8FB0E0"
    accent-soft: "#1F2B3B"
    gain: "#5BBE91"
    loss: "#E07A72"
    stale-amber: "#D9A441"
    stale-red: "#E07A72"
typography:
  hero-figure: { fontFamily: "Source Serif 4", fontSize: 56px, fontWeight: 500, lineHeight: 1.05, fontFeature: "tnum, lnum" }
  title: { fontFamily: "IBM Plex Sans", fontSize: 22px, fontWeight: 600, lineHeight: 1.25 }
  section: { fontFamily: "IBM Plex Sans", fontSize: 13px, fontWeight: 600, letterSpacing: 0.06em, textTransform: uppercase }
  body: { fontFamily: "IBM Plex Sans", fontSize: 15px, fontWeight: 400, lineHeight: 1.5 }
  figure: { fontFamily: "IBM Plex Sans", fontSize: 15px, fontWeight: 500, fontFeature: "tnum, lnum" }
  caption: { fontFamily: "IBM Plex Sans", fontSize: 12px, fontWeight: 400, lineHeight: 1.4 }
spacing:
  unit: 8px
  scale: [4, 8, 12, 16, 24, 32, 48, 64]
rounded:
  sm: 6px
  md: 10px
  pill: 999px
motion:
  fast: 120ms
  base: 180ms
  easing: "cubic-bezier(0.2, 0, 0, 1)"
---

# Design System: Finance Tracker

## Product context

A personal finance tracker for one salaried person in India. All amounts are in Indian rupees (₹) with lakh/crore digit grouping. Desktop (macOS) first, iOS later. See `docs/PRD.md`.

**The one thing to remember:** calm and certain. You open it and trust the number in under five seconds.

## Direction: "Quiet ledger"

It reads like a well-kept accounts book, not a trading screen. Hairlines, generous whitespace, large clear numerals, almost no decoration. Colour carries meaning (gain, loss, staleness), never mood.

### Deliberate departures from the category

1. **Ledger rows, not card grids.** Accounts are rows separated by hairlines. No cards inside cards. No donut charts as the default.
2. **Freshness is first-class.** Every balance shows a source badge (Manual, Imported, Synced) and an age dot that turns amber, then red. Most apps hide staleness; here it is part of the number.
3. **Lakh/crore is designed, not bolted on.** Full grouping (₹12,34,567) is the default; shorthand (₹12.35 L, ₹1.2 Cr) has its own sizing and spacing.

## Typography

- **IBM Plex Sans** for all UI text and figures, with tabular lining numerals (`font-variant-numeric: tabular-nums lining-nums`) so digits align in every column.
- **Source Serif 4** for the hero net-worth figure only. It gives the single most important number weight and a ledger feel.
- Body text is 15px at 1.5 line height; minimum text size is 12px.
- **To verify before shipping:** both families must render the ₹ glyph (U+20B9) correctly and support tabular numerals. If either fails, fall back to the system font (SF Pro on macOS and iOS) for that role.

## Colour

Neutral paper and ink with one restrained slate-blue accent. Light is the default; dark is designed alongside it, not derived.

| Role | Light | Dark |
| --- | --- | --- |
| Background | `#F7F5F0` | `#14171A` |
| Surface | `#FFFFFF` | `#1C2024` |
| Ink | `#1B1F23` | `#ECE9E2` |
| Accent | `#34527A` | `#8FB0E0` |
| Gain | `#2E7D5B` | `#5BBE91` |
| Loss | `#B4443C` | `#E07A72` |
| Stale (amber) | `#B7791F` | `#D9A441` |

Rules:
- Green and red are reserved for gains and losses. Never use them as decoration or for buttons.
- Amber means stale (synced over 7 days, manual over 35 days). Red means stale over 60 days.
- Every text and figure colour must meet WCAG AA contrast on its background.
- Never rely on colour alone: gains and losses also carry a sign (+ or −) and, where space allows, an arrow.

## Layout

- 8px base grid. Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64.
- Desktop: 232px left sidebar, content canvas with a 960px max reading width, persistent top bar showing net worth and the date of the oldest unsynced balance.
- Dashboard: hero figure with monthly change and a thin trend line, a row of view chips (All accounts and saved exclusion views), then group sections (Cash and bank, Investments, Fixed and retirement, Insurance and policies) as ledger rows. Each group header shows its subtotal. Liabilities appears as a full group only when something is recorded; otherwise it is one muted line.
- Prefer borders and background steps over shadows. Radii: 6px controls, 10px panels.
- Touch targets are at least 44px on the iOS adaptation; the sidebar becomes a bottom tab bar.

## Components

- **Ledger row:** account name and institution on the left; balance (tabular, right-aligned) with source badge and age dot on the right. Inline edit on click. Hover is a subtle `surface-sunken` background.
- **Source badge:** small pill, text only (Manual, Imported, Synced), muted ink on `surface-sunken`.
- **Age dot:** 8px dot plus relative age ("3d ago"). Neutral when fresh, amber, then red.
- **Hero figure:** serif, 56px, with the change since last month beneath in gain or loss colour with sign.
- **View chip:** pill toggle above the groups. The selected chip uses `accent-soft` with accent text; choosing one recomputes the hero figure and change. Views are saved exclusion sets.
- **Valuation basis label:** small muted text beside a group title (for example "valued at premiums paid") so a policy value is never mistaken for a market value.
- **Update All step:** one account per screen, value pre-filled, Enter saves and advances, progress count in the corner.
- **Button:** primary is accent fill with white text; secondary is bordered. One primary action per view.
- **Empty states:** plain-language sentence and one action. No illustrations.

## Motion

120 to 180 ms, ease-out, used only to explain change (a row updating, a panel opening). No count-up animations, no confetti, no gradients, and respect `prefers-reduced-motion`.

## Anti-slop rules

No purple or neon gradients, no glow, no decorative blobs, no three-column icon feature grids, no nested cards, no icon tile above every heading, no gamified streaks. Every element earns its place by helping someone read or update a number.

## Open items

- Confirm ₹ glyph and tabular numeral support in the chosen fonts (see Typography).
- Decide the iOS type adaptation (SF Pro vs. the same families).
- Decide how a saved view is created and edited (from the chip row or from settings).
- Define chart styling (net-worth line, allocation) as the first Phase 1 chart is built.

# Finance Tracker: Product Requirements Document

Oct 18, 2026 · Amith K Shinde

## 1. Overview

Finance Tracker is a desktop app that shows your net worth, cash position and obligations across every account in one screen, in Indian rupees (₹), with balances entered by hand or pulled in automatically where India's rails allow it.

**Problem.** Money sits in many places: savings and salary accounts, credit cards, FDs and RDs, mutual funds, stocks, EPF/PPF/NPS, loans, wallets and cash. No single view answers "where do I stand today?" without logging into each one.

**Vision.** Open the app and see an accurate, current number in under five seconds. Updating it takes minutes a month, not hours, and gets easier over time as more accounts sync themselves.

**Goals**

- One dashboard: net worth, liquid cash, investments, and liabilities, as of now.
- Two ways in, same data model: manual entry that takes under 15 seconds per account, and automatic sync where possible.
- Trust: every number shows its source and when it was last updated.
- Built so the same core runs on iOS later without a rewrite.

**Non-goals (v1)**

- Moving money, paying bills or placing trades. The app is read-only toward your accounts.
- Tax filing, credit scoring, or financial advice.
- Multi-user or family sharing (revisit after v1).
- Currencies other than ₹ (foreign holdings are entered in ₹ equivalent for now).

**Success metrics**

| Metric | Target |
| --- | --- |
| Time to see current net worth after opening the app | under 5 seconds |
| Time to update one manual account | under 15 seconds |
| Accounts auto-synced or auto-imported (share of total) | 60% by v1.5 |
| Accounts with data older than 35 days | 0 shown without a stale warning |
| Monthly time spent maintaining the tracker | under 15 minutes |

## 2. User, principles and key scenarios

**Primary user.** One salaried individual in India with many accounts across banks, cards, brokers and government schemes, who is comfortable with technology but does not want a second job maintaining a spreadsheet.

**Design principles**

1. **Glanceable first.** The home screen answers "where do I stand?" without a click.
2. **Manual is a first-class path.** Nothing depends on sync; sync only removes typing.
3. **Never silently wrong.** Every balance carries a source label (Manual, Imported, Synced) and an age. Old data turns amber, then red.
4. **Private by default.** Data stays on the device unless you opt in to sync across devices. Read-only access to accounts, never credentials stored by the app.
5. **Fewest taps.** Frequent actions get a shortcut. Defaults are smart: last-used account, today's date, ₹.

**Key scenarios**

| Scenario | What the user does | Result |
| --- | --- | --- |
| Morning check | Opens the app | Sees net worth, change since last month, and anything stale |
| Month-end update | Opens "Update all" | Steps through accounts that need a number, pre-filled with last value |
| Salary credited | Drops the bank CSV or PDF statement onto the app | Balance and transactions update, duplicates skipped |
| New investment | Quick-adds a fund or FD in under 15 seconds | Appears in the right group with expected value |
| Planning a purchase | Looks at liquid cash and upcoming dues | Knows what is safely spendable this month |

## 3. Accounts and data model

Every account belongs to one of four groups. Net worth = assets minus liabilities, all in ₹. Amounts use Indian digit grouping (₹12,34,567) with an option to show lakh/crore shorthand (₹12.35 L, ₹1.2 Cr).

| Group | Account types | How value is determined |
| --- | --- | --- |
| Cash and bank | Several savings accounts, wallets (Paytm, PhonePe, Pockets), Digital Rupee (e₹), cash in hand | Balance |
| Investments | Mutual funds (SIP and lump sum), stocks and ETFs, bonds, gold (physical, SGB, digital), crypto, real estate (manual) | Units × latest price, or manual value |
| Fixed and retirement | Multiple FDs, RD, PPF, EPF, NPS (Tier 1 and Tier 2), post office schemes | Principal plus accrued interest, or latest statement |
| Insurance and policies | Life insurance and pension policies (LIC and others) | A per-policy valuation basis: premiums paid, surrender value or maturity value. The basis is shown next to the group total |
| Liabilities | Credit cards, home/car/personal loans, EMIs, money owed to others | Outstanding principal and next due date |

**Core entities**

| Entity | Key fields |
| --- | --- |
| Account | name, institution, group, type, currency (₹), opening balance, source mode (manual / import / sync), active flag |
| Balance snapshot | account, amount in ₹, as-of date, source, note. Append-only, so history and trends come free |
| Holding | account, instrument (fund, stock, coin), units, average cost, latest price, price date |
| Transaction | account, date, amount, direction, category, merchant, notes, import batch id (for de-duplication) |
| Liability schedule | account, interest rate, EMI, due day, tenure remaining |
| Goal | name, target ₹, target date, linked accounts |
| Source connection | provider, status, last successful sync, consent expiry |

Each account has its own value and each group has a subtotal; net worth is the sum of the groups. The Liabilities group appears only when something is recorded, otherwise one quiet line says none. Balances are stored as snapshots, never overwritten. This gives net-worth history, makes manual and automatic updates the same operation, and lets the app show stale data honestly.

## 4. Features

P0 is the v1 release, P1 follows within the next two releases, P2 is later.

**P0: the core**

| Feature | Requirement |
| --- | --- |
| Dashboard | Net worth, liquid cash, total investments, total liabilities, change vs last month. Accounts grouped by the four groups, each with source label and age |
| Account management | Add, edit, archive accounts. Templates for common Indian types (savings, credit card, FD, mutual fund, PPF, EPF, home loan) pre-fill fields |
| Manual entry | Update a balance in one field. Pre-filled with the last value, date defaults to today, Enter saves and moves to the next account |
| Update All wizard | Walks through only accounts that are stale or manual, one screen each, keyboard-first |
| Statement import | Drag and drop CSV, XLSX or PDF statements. Column mapping is remembered per bank. Duplicates detected by date, amount and reference |
| Net-worth history | Line chart over time built from snapshots, with 1M, 6M, 1Y and All views |
| Staleness alerts | Amber after 7 days for synced accounts and 35 days for manual ones, red after 60 |
| Spreadsheet import | Bring in an existing Google Sheet or CSV, including years of past totals, so history starts on day one. Maps its rows to accounts and its dated columns to snapshots, with a preview |
| Saved views | Named net-worth views that exclude chosen accounts or groups (for example "without savings" or "without one policy"), switchable on the dashboard with a chip |
| Monthly snapshot | One tap at month end records every account's current value as that month's snapshot, even if some are unchanged. Accounts that need an update are listed first |
| Month-by-month history | A table of group totals and net worth per month, with change against the previous month and a drill-down to each account. Replaces the manual monthly columns of a spreadsheet |
| Allocation view | A single stacked bar and legend showing the share of each group, using tints of one colour. Tapping a segment filters the ledger |
| Search and filter | Find any account or transaction by name, amount, date or tag |
| Local-first storage | All data on the device, encrypted at rest, with one-click export to CSV and JSON backup |
| App lock | Passcode or biometric (Touch ID on Mac, Windows Hello) after idle |

Spreadsheet import and saved views come from how the first user already tracks money in a sheet, so they are P0.

**P1: make it effortless**

| Feature | Requirement |
| --- | --- |
| Maturity and renewal reminders | Each FD, RD, PPF, NPS and policy can carry a maturity or due date. A Coming up list on the dashboard, a calendar view, and a notification 30, 7 and 1 days before. Matured items prompt "renew, move or close" |
| Goals and projections | Targets such as an emergency fund or a purchase, with a date and linked accounts. Progress bar, monthly amount needed, and projected completion at the current pace |
| Asset allocation detail | Drill-down from the allocation bar by instrument type, institution and liquidity, plus a trend of each group over time |
| Automatic price updates | Mutual fund NAVs and stock prices refreshed daily, so holdings revalue without typing |
| Mutual fund and stock import | Import consolidated account statements (CAS) from the registrars to load all folios in one go |
| Email-based capture | Read bank alert and statement emails from Gmail (read-only, opt-in) to log balances and transactions |
| Recurring items | SIPs, EMIs, rent, subscriptions and salary create expected entries automatically, with a "confirm" nudge |
| Credit card and EMI tracker | Outstanding, due date, minimum due and utilisation; a reminder five days before each due date |
| Interest accrual | FD, RD, PPF and EPF values grow automatically from rate and start date, so they do not go stale |
| Auto-categorisation | Rules plus learning from your edits; one-click "apply to similar" |
| Budgets | Monthly limits per category with simple progress bars |
| Goals | Target amount and date, linked accounts, projected completion |
| Command bar | Cmd/Ctrl-K to add a transaction, jump to an account or run a report |

**P2: later**

| Feature | Requirement |
| --- | --- |
| Account Aggregator sync | Consent-based bank, deposit and investment data through a licensed provider (see section 5) |
| iOS app | Same data and design, with widgets and Face ID. Section 7 covers the path |
| Cross-device sync | End-to-end encrypted sync between desktop and iPhone |
| Reports | Monthly and yearly summaries, asset allocation, savings rate, exportable as PDF |
| Capital gains view | Realised and unrealised gains per holding, as an input for tax filing (not tax advice) |
| Insurance and documents | Policy renewals with reminders, and attached PDFs |
| Scenario tools | What if I prepay my loan, raise my SIP, or retire at 55 |

**Ease-of-use features that cut across everything**

- Keyboard shortcuts for every frequent action and a visible shortcut hint on each button.
- Smart defaults: last-used account, today's date, ₹, and remembered categories.
- Undo for any edit or import, with an import preview before anything is saved.
- Quick-add window, opened by a global shortcut, that logs a transaction without showing the main app.
- Month-end reminder through a system notification: "3 accounts need updating".
- Dark and light themes, and large readable numbers on the dashboard.
- Plain-language empty states and a sample-data mode for trying the app.

## 5. Data ingestion: manual and automatic

Automatic is possible in India, but not uniformly. No single method covers every account, so the app supports several and treats manual entry as the fallback for everything. The app never asks for net-banking passwords and never scrapes bank websites.

| Method | Covers | Effort for you | Reliability | Release |
| --- | --- | --- | --- | --- |
| Manual entry | Everything | Lowest per account, recurring | Exact when you enter it | P0 |
| Statement import (CSV, XLSX, PDF) | Bank, card, wallet statements | Download and drop monthly | High once the bank's format is mapped | P0 |
| Public price feeds | Mutual fund NAVs (AMFI publishes a daily file), listed stock and ETF prices, gold | None | High for NAV; stock feeds vary in licence and delay | P1 |
| Consolidated account statement (CAS) | All mutual fund folios (CAMS and KFintech), demat holdings (NSDL, CDSL) | Request by email, drop the PDF | High, but periodic | P1 |
| Email parsing (Gmail, read-only) | Bank debit/credit alerts, card statements, SIP confirmations | One-time permission | Medium; depends on each sender's format | P1 |
| Broker APIs | Holdings and positions at brokers that offer an API | One-time key setup | High; some brokers charge | P1 |
| Interest accrual engine | FD, RD, PPF, loans | Enter terms once | High; computed, not fetched | P1 |
| Account Aggregator (RBI framework) | Banks, deposits, mutual funds, insurance, GST and more, with your consent | Approve consent in an AA app | High, live | P2 |
| EPF, NPS, post office | Retirement and small savings | Passbook or statement upload | Medium; no public API known | P1 via upload |

**On Account Aggregator.** It is the right long-term route to hands-free sync, because you grant time-limited, read-only consent and the data comes straight from the institution. The catch is access: data flows to registered financial information users, and a personal project usually reaches it through a licensed provider or a partner who holds that registration, which can carry fees and onboarding requirements. Whether this is practical for a single-user tool needs to be confirmed with a provider before we commit (open question 1).

**On mobile.** Reading bank SMS is a common Indian shortcut on Android, but iOS does not allow apps to read messages, so SMS capture cannot be the iOS plan. Email, statement import and Account Aggregator work on both platforms.

**Rules for every source**

- Each balance snapshot records its source and timestamp, and the dashboard shows both.
- Imports show a preview and can be undone as a batch.
- When a synced value and a manual value disagree, the newer one wins and the older is kept in history.
- Sync failures never block the app: the account falls back to manual with a clear badge.
- Consents and keys can be revoked from one Connections screen, and expiry dates are shown.

## 6. Experience and screens

The desktop layout is a left sidebar for navigation and a main canvas, with a persistent top bar showing net worth and the date of the oldest unsynced balance. Layouts use a responsive grid and touch-sized targets so they carry to iPhone with a bottom tab bar instead of the sidebar.

| Screen | Purpose | Key elements |
| --- | --- | --- |
| Home dashboard | Where do I stand today | Net worth card with monthly change, four group cards (cash, investments, fixed and retirement, liabilities), net-worth trend, stale-data strip, upcoming dues |
| Accounts | See and edit everything | Grouped list, each row with balance in ₹, source badge, age; inline edit on click; bulk actions |
| Account detail | Understand one account | Balance history chart, transactions, holdings, terms (rate, EMI, due day), source and connection status |
| Update All | Month-end routine | One account per step, pre-filled value, Enter to save and advance, skip, progress count |
| Import | Bring in statements | Drop zone, bank detection, column mapping, preview with duplicates marked, undo |
| Transactions | Review spending | Filters, categories, tags, "apply to similar" |
| Budgets and goals | Plan | Category progress bars, goal projections |
| Connections | Manage automation | Each source with status, last sync, consent expiry, revoke |
| Settings | Control | Security lock, backup and export, number format (full or lakh/crore), theme |

**First-run flow.** Welcome, choose what you hold from a checklist of Indian account types, enter current balances (one screen, keyboard-driven), see the dashboard populated within about five minutes. Connections are offered afterwards, never required.

**Visual direction.** Calm and numeric: large tabular figures, restrained colour, green and red reserved for gains and losses, and amber for staleness. Charts are simple, labelled directly, and readable in both themes.

## 7. Technical approach, security and the path to iOS

The app is local-first: data lives in an encrypted database on your computer, and the interface works fully offline. Business logic (net-worth maths, interest accrual, import parsing, de-duplication) sits in a shared core with no UI code, so a future iOS app reuses it instead of rewriting it.

**Architecture layers**

1. **UI**: dashboard, accounts, wizards. Platform-specific.
2. **Core**: domain models, calculations, categorisation rules, import parsers. Shared across desktop and iOS.
3. **Storage**: SQLite encrypted with SQLCipher, append-only balance snapshots, schema migrations from day one.
4. **Connectors**: one adapter per source (statement parser, price feed, Gmail, broker, Account Aggregator), each returning the same snapshot and transaction shape.
5. **Secrets**: encryption key and tokens in the OS keychain (macOS Keychain, Windows Credential Manager, iOS Keychain).

**Stack options for desktop now and iOS later**

| Option | Desktop | iOS later | Trade-off |
| --- | --- | --- | --- |
| SwiftUI multiplatform | macOS only | Native, shares most UI code | Best iOS result and smallest app; no Windows or Linux |
| Tauri + React + TypeScript | macOS, Windows, Linux | Tauri mobile, or a React Native app that reuses the TypeScript core | One web skill set; iOS UI needs rework |
| Flutter | macOS, Windows, Linux | Same codebase | Single codebase end to end; less native feel, new language |

**Recommendation.** If you use a Mac and only Apple devices, pick SwiftUI. If you may use Windows, or want to build with web skills, pick Tauri with React and TypeScript, and keep the core in a separate package so the iOS app can share it. This is the first decision to confirm (open question 2).

**Security and privacy**

- All data encrypted at rest; app lock with biometrics; auto-lock after idle.
- The app stores no bank passwords or card numbers, and asks only for read access. Account numbers are shown masked (last four digits).
- Gmail access uses the narrowest read-only scope and only for labelled senders you choose.
- No analytics on financial data. Crash reports contain no amounts or account names.
- Backups are encrypted files you control. Optional cross-device sync is end-to-end encrypted so the server cannot read it.
- Consent and deletion: every connection can be revoked, and "delete all my data" really deletes. This also keeps the app aligned with India's Digital Personal Data Protection Act principles if it ever has other users.

**Moving to iOS**

- Keep UI components and design tokens (spacing, colour, type) platform-neutral from the start.
- Avoid desktop-only data sources as the only route to any account: statement import by file share, email, price feeds and Account Aggregator all work on iPhone.
- Plan the sync design in P2 so desktop and iPhone share one encrypted store.
- iOS-specific additions: home-screen widget for net worth, Face ID lock, share-sheet import of statements, notifications for dues and stale balances.

## 8. Roadmap, risks and open questions

Each phase ends with a check you can run yourself. Durations are rough and assume part-time building.

1. **Phase 1, usable tracker (about 3 to 4 weeks).** Accounts, manual entry, dashboard, snapshots, Update All, local encrypted storage, backup export. *Exit: all your real accounts entered and net worth matches your own spreadsheet.*
2. **Phase 2, import (about 2 to 3 weeks).** Statement import for your own banks and cards, de-duplication, undo, staleness alerts. *Exit: a month of statements imported with no duplicates.*
3. **Phase 3, less typing (about 3 to 4 weeks).** NAV and price feeds, CAS import, interest accrual, recurring items, due reminders. *Exit: at least 60% of accounts need no monthly entry.*
4. **Phase 4, smarter (about 3 weeks).** Categorisation, budgets, goals, command bar, Gmail capture. *Exit: month-end update takes under 15 minutes.*
5. **Phase 5, connected (open ended).** Account Aggregator through a provider, then the iOS app and encrypted cross-device sync. *Exit: iPhone shows the same net worth as desktop.*

**Risks**

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Bank statement formats differ and change | Imports break | Per-bank mapping with preview; allow manual column mapping; start with your own banks |
| Account Aggregator not practical for a personal app | No live sync | Plan assumes it is optional; statements, feeds and email already cover most accounts |
| Stock price feeds have licensing or reliability limits | Wrong or late prices | Show price date, allow manual override, prefer broker API or NAV for funds |
| Data loss on one device | Lose history | Encrypted backups, scheduled export reminder, later E2EE sync |
| Stale data looks current | Bad decisions | Mandatory source and age labels, colour-coded staleness |
| Sensitive data exposure | Privacy harm | Local-first, encryption, no stored credentials, minimal scopes |

**Open questions**

- [ ] 1. Is Account Aggregator access realistic for a single-user app? Ask one or two licensed providers about onboarding, cost and individual use before Phase 5.
- [ ] 2. Which computer do you use (Mac or Windows), and will you only ever use Apple phones? This decides the stack in section 7.
- [ ] 3. Which accounts and institutions matter first? Their statement formats set the Phase 2 import work.
- [ ] 4. Do you want single-device only, or desktop and iPhone sharing one store from the start?
- [ ] 5. Do you hold foreign assets, crypto or ESOPs that need ₹ conversion rules?
- [ ] 6. Should the dashboard show lakh/crore shorthand by default?
- [ ] 8. Should goals draw on whole accounts or on a share of an account (for example half of a savings account)?
- [ ] 7. For insurance policies, should the value be premiums paid or surrender value? The data model supports both; the default affects net worth.

Sources: the data-ingestion options reflect general knowledge of India's financial data ecosystem and have not been verified against live provider documentation; confirm AA provider terms, AMFI file access and broker API pricing before building.

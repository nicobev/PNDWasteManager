# Project Notes - Waste Tracker (Physical Implementation)

## Day 1 (8-13-2026)
**Goal:** Get a basic Express server running and connected to Postgres. 

**Done:**
- Initialized project with npm, setup git repo
- Installed dependencies (express, pg, dotenv, cors)
- Basic Express server running on localhost:3000, using test route to confirm
- Connected to Postgres using schema from Capstone [Link](https://docs.google.com/document/d/1ig_61NYoyLxYWOMz7JH9p9BefsvbBNL-wSgzxAfDRnM/edit?usp=sharing) (waste logs table + others from physical data model)
- Built first working route: GET /api/logs - returns rows from waste logs as JSON

**Extra:**
- Using Supabase for hosted Postgres instead of locally hosting, saved setup time and lets me get used to cloud DBs early
- Reused schema from capstone as is, instead of creating new, passed review from teacher anyways
- Had to remember to percent encode database link, lol....

## Day 2 (8-16-2026)

**Goal:** Finish core CRUD routes, add input validation, and get everything tested before starting auth.

**Done:**
- Added POST /api/logs, PUT /api/logs/:id, DELETE /api/logs/:id
- Implemented weight validation per the capstone spec (Fig 2: weight must be a positive number), pulled into a shared validateQuantity() helper instead of duplicating the check across POST and PUT
- Added report generation (POST /api/reports) supporting Daily, Timed, and Trend report types, plus optional category filtering *(this went beyond today's original scope but followed naturally from the log routes)*
- Added GET /api/reports/:id/summary and GET /api/reports/:id/details for pulling report totals and per-ingredient breakdowns
- Fixed a numeric field overflow bug - totalweight/totalvalue on foodwastereport were capped too low (numeric(4,2), max 99.99) for realistic summed data; widened to numeric(10,2)
- Tested all routes in Postman, including edge cases (missing fields, invalid IDs, empty result sets)

**Extra:**
- Went beyond the original capstone schema: added employeeid resolution logic server-side (taken from user_id, not client-supplied) to prevent a client from spoofing which employee a log belongs to
- Left DELETE /api/logs/:id in as a dev-only convenience for clearing bad test data. it's not part of the original UI spec, and conflicts with the audit-trail requirement. I Need to either remove it or lock it behind supervisor-only + soft-delete before this is "done," not just leave the comment in the code
- foodwastereportdetail stores a frozen snapshot of each log's values at report-generation time, not a live reference, so editing a log later doesn't change a report that already summarized it


## Day 3 (8-17-2026)
**Goal:** Add basic authentication and start role-based access control per the capstone's RBAC spec.

**DONE:**
- Refactored the codebase into routes/middleware/utils structure (logs.js, reports.js, auth.js, middleware/auth.js, utils/helpers.js, utils/validation.js) before adding auth, to keep the two changes separate and testable independently
- Added POST /api/login : validates username/password against useraccount using bcrypt, returns a signed JWT
- Replaced placeholder passwordhash seed values with real bcrypt hashes
- Added verifyToken middleware : applied globally to all routes except /api/auth, attaches decoded user info to req.user
- Removed user_id from request bodies entirely : every route now pulls it from req.user.userid, closing the spoofing gap where a client could previously claim to be any employee
- Added isSupervisor middleware, applied to POST /api/reports (report generation) : matches Fig 3's "Generate button restricted to Manager and Supervisor" requirement
- Gated DELETE /api/logs/:id behind isSupervisor as well, since any authenticated user being able to permanently delete a log was a real gap the moment auth existed
- Fixed a signature mismatch in getEmployeeId and bulkInsert : both were updated to accept db as an explicit first argument during the refactor, but call sites in logs.js/reports.js weren't updated to match, which would have broken POST /api/logs, PUT /api/logs/:id, and POST /api/reports entirely. Caught before it caused confusing downstream errors.
- Tested auth flow in Postman: valid/invalid login, protected routes with/without token, Supervisor-only routes with wrong role

**NOT DONE YET:**
- Account management routes (Fig 5: create user, reset password, deactivate, search) don't exist yet - nothing to gate with isSupervisor until these are built. Moving to a future day.

**Extra:**
- DELETE /api/logs/:id stays for now as a Supervisor-gated dev convenience (Option C from earlier discussion) : needs to be removed or converted to soft-delete before this is considered finished. Tracking as an explicit open item, not a silent leftover.
- Database connections route through iPhone ethernet via a proxy fallback when on work wifi that blocks direct Postgres connections : documented in code with a comment so it doesn't look like dead/unexplained logic later.

## Day 4 (8-20-2026)
**Goal:** Build account management routes (Fig 5) and close out remaining backend gaps before moving to the React frontend.

**Done:**
- Built POST /api/users; combined employee + account creation into one transactional route (BEGIN/COMMIT/ROLLBACK), rather than two separate inserts, since the employee record and login credentials are created together in the common "new hire" workflow. Deviates from Fig 5's screen design (which only shows account fields) but matches real-world usage better.
- Built PUT /api/users/password (not /:id/password as originally planned; userid comes from the body/token instead of the URL, since the same route needs to serve both "reset my own password" and "Supervisor resets someone else's")
- Built PUT /api/users/status; Supervisor-only, activate/deactivate
- Built GET /api/users?username=; Supervisor-only, partial case-insensitive search via ILIKE, joined to employee for readable names
- Implemented self-or-supervisor logic for password reset per Fig 5; initially wrote this as a silent fallback (unauthorized requests quietly redirected to reset the requester's own password instead of the target), caught that this let failed unauthorized attempts look like they succeeded, rewrote as an explicit check that returns 403
- Revisited DELETE /api/logs/:id, commented out for potential future use.
- Ran a full Postman regression pass across logs, reports, and account routes with both a Supervisor token and an Employee token, confirming role restrictions hold correctly everywhere after today's auth fixes

**Extra:**
- Critical: bcrypt.compare() was called without await, meaning login accepted any password for any valid username. This was a real authentication bypass, not a minor bug; full auth was silently non-functional despite looking complete after Day 3.
- role was never included in the JWT payload at sign time, so every role-based check was comparing against undefined
- verifyToken middleware existed and was correct, but was never actually mounted in the request pipeline; req.user was never being set for any route
- isRole middleware factory was being passed as a bare reference in one route instead of being invoked with a roles array, causing a parameter-shift bug
- PUT /api/users/status was missing a response on the success path, causing requests to hang indefinitely instead of erroring
- Consistently kept passwordhash out of every response by using explicit column lists instead of SELECT * or RETURNING * on any useraccount query

## Day 5 (???)

**Goal:** Get React fundamentals down and scaffold the four screens already designed in the capstone (Login, Waste Log Entry, Report Generation/Display, Account Management), so tomorrow can focus on wiring them to the now-working backend instead of learning React from scratch mid-integration.

**TODO:**
- [ ] Set up the React project (Vite, not Create React App; faster, simpler default toolchain) inside the same repo, as a `client/` folder alongside the existing Express backend
- [ ] Learn/refresh function components, `useState`, `useEffect`, and basic props; enough to build static, non-interactive versions of each screen first
- [ ] Scaffold Login screen; username/password fields, submit button, no real auth wiring yet, just the UI shell matching Fig 1
- [ ] Scaffold Waste Log Entry screen; ingredient dropdown (hardcoded options for now), weight input, matching Fig 2's layout and validation cues (numeric-only weight field)
- [ ] Scaffold Report Generation screen; radio buttons for Daily/Timed/Trend, date pickers, category dropdown, matching Fig 3
- [ ] Scaffold Report Display screen; static table shell for showing report results, matching Fig 4
- [ ] Scaffold Account Management screen; username search bar, role dropdown, status toggle, matching Fig 5
- [ ] Confirm all five scaffolds render without errors before calling it done for the day; actual API calls are tomorrow's work, not today's

**Notes for tomorrow:**
- Today is deliberately UI-only, no `fetch`/`axios` calls yet; keeps today's scope to "learn React + build static shells," and tomorrow's scope to "wire shells to the real API," rather than debugging both at once
- Since the interface structure diagram and all five prototypes already exist from the capstone, today is translation work (design -> component), not new design work; should move faster than learning React from a blank page would
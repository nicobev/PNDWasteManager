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

## Day 4 (???)
**Goal:** Build account management routes (Fig 5) and close out remaining backend gaps before moving to the React frontend.

**TODO:**
- [ ] Build POST /api/users (create user account) - Supervisor-only
- [ ] Build PUT /api/users/:id/password (reset password) - Supervisor-only, generates new passwordhash
- [ ] Build PUT /api/users/:id/status (activate/deactivate) - Supervisor-only
- [ ] Build GET /api/users?username= (search by username) - Supervisor-only
- [ ] Add role-based visibility check for self-service password reset (per Fig 5: Employees can modify their own password, nothing else)
- [ ] Revisit DELETE /api/logs/:id - confirm it's still needed, or convert to soft-delete before moving past backend work
- [ ] Full Postman regression pass across logs, reports, and new account routes with a Supervisor token AND an Employee token, to confirm role restrictions actually hold everywhere they should
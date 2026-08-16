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
- Fixed a numeric field overflow bug — totalweight/totalvalue on foodwastereport were capped too low (numeric(4,2), max 99.99) for realistic summed data; widened to numeric(10,2)
- Tested all routes in Postman, including edge cases (missing fields, invalid IDs, empty result sets)

**Extra:**
- Went beyond the original capstone schema: added employeeid resolution logic server-side (taken from user_id, not client-supplied) to prevent a client from spoofing which employee a log belongs to
- Left DELETE /api/logs/:id in as a dev-only convenience for clearing bad test data. it's not part of the original UI spec, and conflicts with the audit-trail requirement. I Need to either remove it or lock it behind supervisor-only + soft-delete before this is "done," not just leave the comment in the code
- foodwastereportdetail stores a frozen snapshot of each log's values at report-generation time, not a live reference, so editing a log later doesn't change a report that already summarized it


## Day 3 (???)
**Goal:** Add basic authentication so routes aren't wide open, and start wiring role-based access (Employee vs Supervisor) per the capstone's RBAC spec.

**TODO:**
- [ ] Add a login route (POST /api/login), validate username/password against useraccount, return a JSON Web Token
- [ ] Hash passwords properly (bcrypt), replace the placeholder passwordhash values in seed data with real hashes
- [ ] Add auth middleware to protect routes, verify JWT, attach user info to req
- [ ] Replace user_id-in-body  with user_id pulled from the authenticated session/token instead, closes the spoofing gap 
- [ ] Enforce role-based restrictions per capstone spec (Fig 3/Fig 5): report generation and account management routes should be Supervisor-only
- [ ] Test auth flow in Postman: valid login, invalid login, protected route with/without token, protected route with wrong role
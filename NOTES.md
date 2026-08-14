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

## Day 2 (8-14-2026??)

**TODO:**
- [ ] Add POST /api/logs : create a new waste log entry
- [ ] Add PUT /api/logs/:id : edit an existing entry
- [ ] Add DELETE /api/logs/:id : remove an entry
- [ ] Implement validation rules I already defined in the capstone (check the capstone doc for the exact rules... don't redesign them)
- [ ] Test all routes before moving to auth
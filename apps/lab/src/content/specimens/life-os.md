---
specimenId: "SPEC-001"
title: "Life OS"
tagline: "An AI that reads your inbox and keeps your job applications up to date on its own."
year: 2026
stack: ["Flutter", "Dart", "Supabase", "PostgreSQL", "Groq / Llama 3.3 70B", "Gmail API"]
status: "shipped"
demoType: "playable"
repoUrl: "https://github.com/zzaaid03/life-os"
liveUrl: "https://lifeos.deadthrone.dev"
role: "Sole developer: product, architecture, Flutter client, Postgres schema and security model, and the AI layer."
order: 1
---

## What it is

Life OS keeps your job hunt, your goals, and your daily tasks in one place, and puts an AI layer
over all three. It reads your inbox to track every application you've sent, breaks long-term goals
into tasks you can start today, and gives you a daily brief on what actually matters.

## Why I built it

My job search was scattered across four places at once: applications buried in email, deadlines in
a calendar, to-dos in a task app, everything else in notes. Nothing talked to anything else, so
keeping it in sync was itself a chore. I wanted one place that did the syncing for me.

## What the AI actually does

The AI isn't one feature bolted on the side. It runs through three server-side functions.

**Inbox scanning.** It reads incoming mail, decides which messages relate to a job application, and
extracts the company and the role. If that application already exists it updates the status rather
than creating a duplicate. It handles the obvious cases and the indirect ones, where neither the
company nor the role is ever stated plainly. Unrelated mail is ignored, unless it contains
something you actually need to do, in which case it becomes a task.

**Goal decomposition.** You type a goal in plain language and get back an ordered set of small,
doable tasks that lead to it. A goal you'd otherwise never start becomes something you can begin
this afternoon.

**Daily brief.** A short morning summary built server-side from your tasks, goals, habits, and
applications.

**Why Llama 3.3 70B on Groq.** Cost, mainly. This is an app I use every day rather than a funded
product, and a per-token bill would have killed it before it ever became useful. Groq's free tier
covers the volume I actually need. The two jobs I ask of the model (read an email and return
structured fields, turn a sentence into a task list) don't require a frontier model to do well.

## The hard part

Two problems, and neither was the one I expected.

**Postgres has two independent permission layers, and getting one right isn't enough.**

I wrote Row Level Security policies on every table so a user can only ever touch rows where
`auth.uid()` matches their own id. The policies were correct. Every query still failed with
`permission denied (42501)`.

RLS decides *which rows* a role may see. Table-level `GRANT`s decide whether that role may open the
table at all. Supabase issues those grants automatically for tables created through its dashboard,
but not for tables created in raw SQL migrations, which is how I created mine. I had airtight row
policies protecting tables nobody was permitted to touch.

From the outside it wasn't subtle. Sign-in worked, and then the app could read and write nothing at
all: every query came back `42501 permission denied`. That error reads like an authorization
failure, so the instinct is to go back and re-check the row policies. The policies were fine, so
re-reading them taught me nothing. The fix only appeared once I stopped asking "which rows is this
user allowed to see" and started asking "is this role allowed to open the table at all."

Once I understood the failure mode, I stopped fixing it one table at a time and fixed it as a class:
every table, every role, in one pass, including the separate `service_role` grants the server-side
functions need to build the daily brief without going through a user session at all.

**Getting a language model to return data a program can rely on.**

The inbox scanner isn't a chat feature. Its output writes directly into a user's application
tracker, so "usually correct" isn't good enough. The model runs server-side in an Edge Function and
every response is parsed and validated before anything touches the database. When the model returns
something that isn't valid JSON, the function fails loudly with the raw response attached rather
than passing malformed data downstream. I'd rather a scan visibly fail than silently corrupt
someone's tracker.

## On privacy

The app reads your email, so this mattered from the start. Gmail access is OAuth-scoped and stored
per user. To stop re-scanning suggesting the same task twice, the app records which messages it has
already seen, but it stores **only the opaque Gmail message id, never any email content**. Nothing
from the body of your mail is persisted.

## Where it stands

Live on the web, with an Android APK built and an iOS build running on my own phone. In active use,
by me, every day.

## What I'd change

I built it for job hunters because that was my problem at the time, and that focus shaped decisions
all the way down. If I started again I'd build the same engine (inbox parsing, goal decomposition,
daily briefing) as something general, and treat job hunting as one thing you can point it at rather
than the thing it's built around.

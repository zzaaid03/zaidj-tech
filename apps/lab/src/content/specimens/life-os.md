---
specimenId: "SPEC-001"
title: "Life OS"
tagline: "An AI that reads your inbox and keeps your job applications up to date on its own."
year: 2026
stack: ["Flutter", "Dart", "Supabase", "PostgreSQL", "Supabase Storage", "Groq / GPT-OSS 120B", "Gmail API"]
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
into tasks you can start today, and gives you a daily brief on what actually matters. It also holds
the documents that go with all of that, and lets you find one by describing it rather than by
remembering what you named the file.

## Why I built it

My job search was scattered across four places at once: applications buried in email, deadlines in
a calendar, to-dos in a task app, everything else in notes. Nothing talked to anything else, so
keeping it in sync was itself a chore. I wanted one place that did the syncing for me.

## What the AI actually does

The AI isn't one feature bolted on the side, and it also isn't everywhere. Three server-side functions call the model. A fourth deliberately does not.

**Inbox scanning.** It reads incoming mail looking for several different things: an update to a job
application, anything else that needs an action from you, a bill due, an appointment, a delivery to
collect, and a subscription starting or renewing. For a job update it extracts the company and role
and, if that application already exists, updates its status rather than creating a duplicate. It
handles the obvious cases and the indirect ones, where neither company nor role is ever stated
plainly. For a task it fills in a real due date when the email states one plainly, and leaves it
blank rather than guess when it does not. A subscription is proposed as its own review card rather
than folded into the task list, and adding one creates a real subscription record rather than a
task that gets checked off and forgotten. Mail that fits none of that is ignored.

**Subscription tracking.** Once a subscription exists, the app can answer a question the old task
list never really could: what am I paying for. Amounts are stored as whole cents rather than a
floating point number, because floating point money turns into something like
30.299999999999997 the moment you add a few of them together for a total. Currency is stored per
row and never converted. There's no exchange rate source built into the app, and making one up
would put an invented number on a screen that's supposed to be about real money, so totals across
currencies show as separate lines rather than one combined figure.

**Goal decomposition.** You type a goal in plain language and get back an ordered set of small,
doable tasks that lead to it. A goal you'd otherwise never start becomes something you can begin
this afternoon.

**Finding a document you stored months ago.** The model here is text only, so it cannot look at a
photo of a passport and tell you what it is. Rather than pretend otherwise, adding a file asks you
for one line describing it. The model then takes that line and the file name, nothing else, and
returns a few other words someone might reasonably search for. Call something "my flat lease" and it
answers to "tenancy" and "rental contract" too. That happens once, when the file is added. The
search itself is plain string matching with no model in it, so the same query always returns the
same thing, instantly and for free.

**Daily brief.** A short morning summary of what is overdue, what is due today, your top priority, and where each application stands. This one has no model in it at all. Every sentence is assembled in code from your own data. A language model would have cost tokens to restate numbers I already have, and it could get them wrong. Counts about your own life are the last thing that should be hallucinated.

**The weekly review.** Every week that's ended, Monday to Monday, gets a summary once it's actually
over, so the numbers in it are never "so far", always final. It reports only what the underlying
rows can support. There's no table anywhere that records when a job application's status changed,
only what it is now, so the review can say an application's gone quiet, but it can't say one moved
to interview this week, and it doesn't pretend to know that.

**Why GPT-OSS 120B on Groq.** Cost, mainly. This is an app I use every day rather than a funded
product, and a per-token bill would have killed it before it ever became useful. Groq's free tier
covers the volume I actually need. The two jobs I ask of the model (read an email and return
structured fields, turn a sentence into a task list) don't require a frontier model to do well.
Groq decommissioned the model I'd originally picked, Llama 3.3 70B, and every free model on the
platform turned out to share the same rate limit, so a slower request batch was the actual fix,
not a different model.

## The hard part

Three problems, and none of them was the one I expected.

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

Adding file storage later turned out to be the same lesson a third time. Files live in two places at
once: a row of metadata in Postgres and the actual bytes in a storage bucket. Those are separate
systems with separate policies, and locking down the table does nothing for the bucket. The tempting
mistake is to secure the thing you can see in your schema and assume the file went with it. So the
bucket got its own policies, written and tested at the same time as the table's, and I verified both
from outside the app afterwards rather than trusting that they were applied.

**Getting a language model to return data a program can rely on.**

The inbox scanner isn't a chat feature. Its output writes directly into a user's application
tracker, so "usually correct" isn't good enough. The model runs server-side in an Edge Function and
every response is parsed and validated before anything touches the database. When the model returns
something that isn't valid JSON, the function fails loudly with the raw response attached rather
than passing malformed data downstream. I'd rather a scan visibly fail than silently corrupt
someone's tracker.

**A thumbnail that quietly downloads the entire file.**

Once the app stored documents, lists of them wanted little image previews. Flutter's network image
widget takes a `cacheWidth`, and it is very easy to read that as "only fetch what you need". It
isn't. It shrinks the image after the whole file has already come down the wire. Twenty photos taken
on a phone, drawn as forty pixel squares, still pull tens of megabytes, and the storage bandwidth is
shared across everyone using the app rather than being per person.

So previews never come from storage at all. When you add an image the client re-encodes it down to a
preview of about two kilobytes and saves that on the metadata row, right next to the file name. A
list of files is then a single query that already contains everything needed to draw itself.
Fetching real bytes happens exactly once, when you open something.

What makes this one worth remembering is that the wrong version works. It looks correct on a fast
laptop with three test files. It only becomes a problem later, spread across other people's data
allowances, which is the hardest kind of mistake to notice in time.

## On privacy

The app reads your email, so this mattered from the start. Gmail access is OAuth-scoped and stored
per user. To stop re-scanning suggesting the same task twice, the app records which messages it has
already seen, but it stores **only the opaque Gmail message id, never any email content**. Nothing
from the body of your mail is persisted.

Stored documents follow the same principle. The contents of a file are never sent to the model,
which only ever receives the file name and the line you wrote describing it. Files can also be
marked private one by one, and a private file skips labelling entirely rather than having the result
thrown away afterwards. Passports and contracts were the obvious things people would put in here, so
the toggle existed before the feature shipped rather than being added once someone asked for it.

## Where it stands

Live on the web, with an Android APK built and an iOS build running on my own phone. In active use,
by me, every day.

## What I'd change

I built it for job hunters because that was my problem at the time, and that focus shaped decisions
all the way down. If I started again I'd build the same engine (inbox parsing, goal decomposition,
daily briefing) as something general, and treat job hunting as one thing you can point it at rather
than the thing it's built around.

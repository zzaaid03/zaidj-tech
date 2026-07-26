---
specimenId: "SPEC-002"
title: "Uni-Plan"
tagline: "Check a semester for clashes and GPA impact before you register, not after."
year: 2026
stack: ["React", "Express", "TypeScript"]
status: "shipped"
demoType: "playable"
repoUrl: "https://github.com/zzaaid03/Uni-Plan"
role: "Built the scheduling engine, conflict-detection logic, and GPA prediction, plus the full React/Express app."
order: 2
---

Registration makes you answer two questions at once: does this timetable actually work, and what will it do to my GPA. Uni-Plan answers both before you commit to anything.

You enter your courses with credits, grade, day and time slot. It compares every pair of courses on the same day and tells you exactly which ones overlap, instead of just warning that something somewhere is wrong. Alongside that it computes a credit-weighted GPA, so you can add an elective, see the effect, and change your mind while changing your mind is still free.

It is a small app, deliberately: a React and TypeScript frontend against an Express API with two endpoints, one for conflicts and one for GPA. The logic is the product and the rest is plumbing.

The demo on this page is the real thing. I ported the actual conflict-detection and GPA functions into the browser, so what you are poking at is the same logic the app runs, not a mock-up of it.

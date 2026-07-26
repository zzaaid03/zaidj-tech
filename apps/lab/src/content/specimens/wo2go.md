---
specimenId: "SPEC-005"
title: "wo2go"
tagline: 'Not "how do I get to Hamburg" but "I am standing here, where can I actually get to?"'
year: 2026
stack: ["Next.js", "TypeScript"]
status: "pending"
demoType: "static"
repoUrl: "https://github.com/zzaaid03/wo2go"
role: "Designing and building the route-search approach and the Next.js app around it."
order: 5
---

Most journey planners assume you already know where you are going. wo2go assumes you do not. You give it one station, and it tells you everywhere you can reach from there without changing trains, sorted by how long it takes.

I built it because I like knowing my options even when I do not need them. With a Deutschlandticket, the real question standing on a platform is rarely how to reach one specific place. It is what is actually available to me right now.

The core is a single pure function. For every departure in the next couple of hours it walks that train's remaining stops, treats each one as a reachable destination, computes the travel time from your departure to that arrival, then groups by station to find the fastest option, how often it runs, and which services get you there. Filters narrow it to regional only, major stations only, or high speed only.

Honest status: the logic works and is tested, but the app is parked. It reads live data from Deutsche Bahn's public transport API, and that API has been failing, which takes the app down with it. That is a dependency problem, not a design one.

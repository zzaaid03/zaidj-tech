---
specimenId: "SPEC-004"
title: "Brewit"
tagline: "Tell it how you want the coffee to taste, and it works backwards to a recipe."
year: 2026
stack: ["React", "TypeScript"]
status: "in-lab"
demoType: "playable"
repoUrl: "https://github.com/zzaaid03/Brewit"
role: "Building the app and its brewing-recipe logic in React and TypeScript."
order: 4
---

Most brewing guides run one direction: here is a method, follow it, get whatever you get. Brewit runs the other way. You describe the cup you want, and it works back to the parameters that should get you there.

You give it what you have and what you are after: bean origin, roast level, brewing method, water temperature, and the tasting notes you want. It returns a recipe aimed at those notes.

I built it because I love coffee and could not find an open source tool that generated recipes rather than just listing them.

Honest status: the recipe logic works, but it is more rigid than it should be. It behaves like a lookup table rather than something that genuinely reasons about the inputs, and it is not interactive enough. That is the next problem to solve, and it is why this one sits in the lab instead of on the shelf above.

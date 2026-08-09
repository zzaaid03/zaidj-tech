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

You tell it the method, the roast, how the bean was processed, how much brewing experience you have, and the taste you are chasing. It returns a full recipe: dose, ratio, water temperature, grind setting, a timed pour schedule with the actual gram split for each pour, and a short troubleshooting list for when the cup comes out sour, bitter, weak, or thin.

The engine is not a set of stored recipes. It starts from a base dose and ratio chosen by experience level, applies shifts for roast, taste goal, and process, clamps the result into a defensible range (ratio 14 to 18, temperature 88C to 97C), and only then builds the pour schedule for the chosen method. Change one field and every number downstream of it moves.

Process is the shift I am most confident defending: more fermentation means a cooler start, because heat amplifies ferment character into harshness. Washed gets no shift, honey a little cooler, natural cooler still, anaerobic coolest.

Origin is deliberately the exception. It shows up as a note on the recipe and it changes no numbers. I could have invented an origin table, but I could not defend the numbers in it, so I left it as information instead of a fake input.

The piece I am happiest with is the export. A recipe serializes into a Bean Conqueror shaped file and goes out through the Web Share API, falling back to a plain download when sharing is not available. Worth saying plainly: I tried importing the result into Bean Conqueror and it did not take. The file generates, the round trip does not work yet.

The newest piece is a live brew mode. The recipe already knew the timing, but reading a table while the water goes cold is not how brewing actually goes, so now the plan runs itself. You press start and it counts up, tells you which pour you are on, and shows a running total to pour to rather than an amount to add, because a scale shows total weight and doing that arithmetic mid pour is where I kept making mistakes. It beeps at each transition and holds the phone screen awake while it runs.

I also cut saved recipes. They were tied to anonymous auth, so a recipe lived in one browser and disappeared the moment site data was cleared. Building real accounts was more than this project needed, so the feature went instead of growing. The export is how you keep a recipe now, and the app talks to no server at all.

The newest addition closes part of that gap. If the cup came out sour you press one button and the recipe corrects itself, one variable at a time, and it lists what it changed. Grind for sour and bitter, ratio for weak, temperature for dry. When a setting has nowhere left to go it says so instead of pretending it adjusted something, which took two attempts to get right. The first version checked the number you typed rather than the number the engine actually uses after its own shifts, so it reported changes that never happened.

I also pulled the origin list from a public coffee database at build time instead of calling it from the browser, so each country now carries a real description. The app makes no network requests at all now.

Honest status: this one is still in the lab. The export does not round trip. The corrections only live in the current session, so there is still no brew log and closing the tab loses everything. The engine and the brew timer are the parts I would defend. The rest of the app is not finished.

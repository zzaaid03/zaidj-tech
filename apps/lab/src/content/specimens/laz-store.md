---
specimenId: "SPEC-003"
title: "LAZ Store"
tagline: "Tesla aftermarket parts, from a shop I actually ran to an Android app."
year: 2026
stack: ["Kotlin", "Jetpack Compose", "Firebase", "AI"]
status: "shipped"
demoType: "recreation"
repoUrl: "https://github.com/zzaaid03/laz-store"
role: "Built the Android app in Kotlin/Jetpack Compose and integrated the AI parts-identification flow."
order: 3
---

LAZ Store is not a portfolio exercise. LAZ was my online car parts business in Jordan, and this app is that business rebuilt as software: a bilingual Android storefront with three separate role-based interfaces, one for customers, one for employees, one for admins.

The part I care about is identification. A customer photographs a part they cannot name, the app sends the image to Claude or GPT-4 through OpenRouter, and gets back likely matches, compatibility, and pricing, then answers follow-up questions in a chat.

The useful decision there was not which model to call. It was what the AI was for. When someone asked for a part I did not stock, the chat turned it into a potential order on my admin screen, with their photos attached, so I could price it and source it. The app was telling me what to stock next.

Everything behind the storefront is there too: inventory, order processing, returns, and sales analytics, with the cart syncing across devices in real time through Firebase. The whole app runs in Arabic and English, which the Jordanian market needs.

Because it is a native Android app it cannot run in a browser. The demo below is an honest recreation of the identification flow, rebuilt in React from the real screens, not the app itself.

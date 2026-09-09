# Slime Merge

A top-down, cozy forest merge-defense game. Open `index.html` in a browser, or serve this directory with `python3 -m http.server 8000` and visit http://localhost:8000.

- Start with 100 coins and nine empty deployment tiles.
- Recruit caveman slimes for 50 coins; each successful purchase increases the next price by 50.
- Level 1 slimes automatically shoot for 25 damage every 1.5 seconds.
- Select or drag two matching slimes together to merge. Each level doubles damage and multiplies the firing interval by 0.78 (minimum 0.22 seconds).
- The first zombie appears immediately; another spawns every 5 seconds of active play. Each has 100 HP, a red health bar, and numeric health.
- Defeating a zombie awards 50 coins. Five zombies reaching camp ends the run.

## Controls

Mouse/touch: click two matching slimes or drag one onto the other. Click Recruit slime to buy. An slime can also move to an empty tile.

Keyboard: arrows/WASD to choose a tile, Enter/Space to select or merge, B to buy, P to pause. Enter resumes or restarts from the overlay.

Gamepad: D-pad/left stick to choose a tile, A to select/merge or resume/restart, X to buy, B to cancel selection, Start to pause. Start + Select and Guide are reserved for exiting to RunXR.

## RunXR

Built against https://runxr.app/docs. The optional SDK reports ready status and defeated-zombie scores and supports exiting from the pause screen. The game remains playable without the SDK. No build step or runtime dependencies are required; the web font has system fallbacks.

Upload the static files `index.html`, `style.css`, and `game.js`, or host them at a public HTTPS URL that allows iframe embedding. `little-outpost.zip` contains these files. In RunXR Dev Studio, add a draft with:

- Title: Slime Merge
- Category: Strategy / Merge (choose the closest available category)
- Description: Small slimes. Big last stand. Recruit a crew of little bow-wielding heroes, merge them into stronger defenders, and protect your forest outpost from wandering zombies.
- Features: Gamepad Controls, Screen Controls
- Controls: use the mappings above.

Add listing artwork and the hosted game URL in Dev Studio. RunXR reviews drafts before publication. This project has not been uploaded or published.

## Verification

Run `node --check game.js` and `node test.cjs`. The simulation tests cover starting values, purchase prices, insufficient funds, merge stats, zombie timing, arrow damage, kill rewards, pause, camp damage, and full-grid purchase protection.

## Bosses and outfits

Level 1 slimes wear caveman hides; level 2 wears a medieval ranger hood, followed by helmets, plate armor, plumes, and crowns. Higher levels vary armor colors and crown colors. All keep their bows.

The red top-center meter counts zombie defeats from 0/20 to 20/20. At 20, a boss spawns and regular spawning pauses. Bosses cycle through ogre, skeleton king, demon, golem, and dragon designs. The first has 200 HP, increasing by 50 per defeated boss. Defeating a boss awards 150 coins, adds one completed wave, resets the meter, and restarts the 5-second zombie timer. A boss reaching camp ends the run.

The interface fills the viewport with a compact HUD and bottom recruit button. The ? button opens controls and pauses play.

## Portal and Moon

Portal (keyboard O, gamepad Y) unlocks after 100 forest zombie defeats. Choose Travel in the portal screen (gamepad A / Enter). The Moon starts with 100 coins, base recruit price, empty grid, full lives, and zero kills/waves. Alien enemies replace zombies and each slime level has futuristic gear. Returning restores the exact forest state; revisiting the Moon restores its state too. World progress stays in memory for the current page session; reloading starts a new game. Inactive worlds do not advance. Regular enemies spawn every 5 seconds outside boss battles.

Hold a slime and move the mouse or finger to drag it. Release onto a matching slime to merge, or an empty tile to move; releasing outside the grid or cancelling leaves it on its original tile.

## Wave difficulty and slime health

Each completed boss wave adds one enemy per 5-second spawn and 50 health to regular enemies: 1 × 100 HP initially, 2 × 150 HP after one wave, 3 × 200 HP after two. This applies to forest zombies and Moon aliens. Regular enemies move at 22 world units/second (previously 17); bosses move at 13 (previously 10).

Enemies chase the nearest slime and attack within 48 world units. Slimes have 100 HP and visible health bars. Regular attacks deal 10 damage once per second; bosses deal 25. Dead slimes leave an empty tile. Merging restores 100 HP. Without defenders, enemies advance toward camp. Dragging a slime changes its visual position; its original tile remains its combat position until released.

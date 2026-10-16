# Pixel Guard

A pixel-art monster defense shooter for phones, built with [Phaser 3](https://phaser.io) and Vite.

You are a little pixel guard holding the castle gate. Slide your finger to move: left and right, and up and down in the lower part of the screen to dodge the dragon's fireballs. You shoot automatically, and touching a monster hurts. Waves of monsters get stronger every wave.
- **Monsters:**
  - slimes and slow stone golems from level 1;
  - big slimes that split, and ghosts that sway slowly and always take 3 hits, from level 3;
  - fast bats that pop in one hit, and skeleton archers that shoot bones, from level 4;
  - an Ogre King (drops a treasure chest) and the Red Dragon boss in every level.
- **Level-ups:** kill monsters to level up: twice in the first wave, then once per wave. Pick 1 of 3 upgrades. Each card shows exactly what changes, and maxed-out upgrades are never offered. These are stronger bolts or new **attack stances**: Fire Fan, Lightning Beam, Shield Orbit, Spirit Missiles and Shockwave. Each stance evolves at level 5.
- **Treasure chests:** catch the ones dropped by the Ogre King, or shoot them open, for extra upgrades.
- **Rewarded ads:** watch one to revive, double your coins, or reroll the cards. Once per run, an ad can also **TAKE ALL** the cards on a bonus screen.
- **10 levels:** Meadow, Dark Forest, Crystal Cave, Murky Swamp, Scorched Desert, Ice Peaks, Volcano, Graveyard, Castle Ruins and Dark Realm. Monsters get tougher with every wave and every level.
- **Shop:** between runs, spend **coins** on permanent upgrades. **Gems**, from bosses, ads and the store, buy the strongest ones. Monsters adapt a little to your upgrades.

## Play / develop

```bash
npm install
npm run dev        # http://localhost:5173 (also reachable from your phone on the same Wi-Fi)
npm run build      # production build in dist/
```

Controls: drag anywhere on the screen to move (left/right, and up/down in the lower part of the screen). On desktop, the arrow keys or WASD also work.

Testing URL flags:
| Flag | Effect |
|------|--------|
| `?debug` | All levels unlocked, lots of currency, in-game SKIP / +LVL buttons |
| `?level=3` | Jump straight into level 3 |
| `?autoplay` | A bot plays (used for balance testing) |
| `?speed=3` | Run the game 3× faster |

## Project layout

```
src/
  main.js               Phaser config (360×640 portrait, scales to any phone)
  config.js             Screen size + URL flags
  art/palette.js        Shared 16-colour palette
  art/sprites/          Pixel maps: hero (guard, bolts), items, monsters
  art/pixelSprites.js   Turns the pixel maps into textures + animations; level grounds
  data/                 Balancing lives here – edit numbers, not code
    enemies.js          Enemy stats
    levels.js           10 levels, wave sizes, difficulty curve, XP curve
    upgrades.js         In-run upgrade cards and attack stances
    shop.js             Permanent upgrades (coins / gems), monster adaptation
    store.js            Real-money packs (placeholders)
  scenes/               Boot, Menu, LevelSelect, Shop, Store, Game, LevelUp, Pause, Result
  systems/              WaveSpawner, SaveSystem (localStorage), Audio (synthesized SFX)
  services/monetization.js   Rewarded ads + in-app purchases (mocked in the browser)
public/                 PWA manifest, service worker, icons
scripts/make-icons.mjs  Regenerates the app icons from the guard sprite
scripts/preview-sprites.mjs  Renders/validates the pixel art
```

### Pixel art
All sprites are text pixel maps in `src/art/sprites/*.js`, one character per pixel, using the shared 16-colour palette in `src/art/palette.js` (see `_example.js`). Sprites with several frames are animated automatically.
- Preview and validate them with `node scripts/preview-sprites.mjs out.png [group]`, which writes a scaled-up contact sheet.
- To use real art instead, load a PNG with the same key (`guard`, `slime`, `dragon`, `chest`, …) in `Boot.preload()` and remove that sprite from its group file.

## Publishing

**Web (now):** the game is hosted on [Netlify](https://www.netlify.com), using the settings in `netlify.toml`.
1. Every push to `main` builds and deploys automatically.
2. Every pull request gets its own preview link.
3. The site link is in the Netlify dashboard. You can rename it under **Site configuration → Change site name**.
4. On your phone, open the link and choose "Add to Home screen" to install it.

**Google Play (next step):** real ads and payments only work in a store app.
1. Add Capacitor:
   ```bash
   npm i @capacitor/core @capacitor/cli @capacitor/android
   npx cap init "Pixel Guard" com.waterdroid47.pixelguard --web-dir dist
   npx cap add android
   npm run build && npx cap sync && npx cap open android
   ```
2. Ads: install `@capacitor-community/admob` and create a rewarded ad unit in AdMob.
3. Purchases: install `cordova-plugin-purchase` and create the products from `src/data/store.js` in the Play Console.
4. Implement the `native` object in `src/services/monetization.js`. Nothing else in the game needs to change.
5. Build a signed AAB in Android Studio and upload it to the Play Console. That needs:
   - a developer account ($25 one-time)
   - a privacy policy URL
   - the ads declaration

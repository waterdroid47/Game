# Cell Defender

A mobile roguelike cell-defense shooter, built with [Phaser 3](https://phaser.io) and Vite.

You are a cell guarding the body. Slide your finger to move: left and right, and up and down in the lower part of the screen to dodge the boss's attacks. You shoot automatically, and touching an enemy hurts. Waves of viruses, germs and bacteria get stronger every wave.
- **Enemies:**
  - viruses and slow tanks from level 1, and splitters from level 3;
  - teal drifters from level 3: they sway slowly and always take 3 hits;
  - fast yellow germs from level 4: they pop in one hit;
  - shooters from level 4, plus elites and a boss in every level.
- **Level-ups:** kill enemies to level up, then pick 1 of 3 upgrades. Each card shows exactly what changes, and maxed-out upgrades are never offered. These are stronger shots or new **attack stances**: Spread Shot, Enzyme Laser, Antibody Ring, Homing Phage and Immune Pulse. Each stance evolves at level 5.
- **Bonus chests:** catch the ones that fall from elite enemies, or shoot them open, for extra upgrades.
- **Rewarded ads:** watch one to revive, double your coins, or reroll the cards. Once per run, an ad can also **TAKE ALL** the cards on a bonus screen.
- **Shop:** between runs, spend **coins** on permanent upgrades. **DNA**, from bosses, ads and the store, buys the strongest ones.

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
  art/pixelSprites.js   All pixel art, drawn from text pixel maps (no image files needed)
  data/                 Balancing lives here – edit numbers, not code
    enemies.js          Enemy stats
    levels.js           10 levels, wave sizes, difficulty curve, XP curve
    upgrades.js         In-run upgrade cards and attack stances
    shop.js             Permanent upgrades (coins / DNA)
    store.js            Real-money packs (placeholders)
  scenes/               Boot, Menu, LevelSelect, Shop, Store, Game, LevelUp, Pause, Result
  systems/              WaveSpawner, SaveSystem (localStorage), Audio (synthesized SFX)
  services/monetization.js   Rewarded ads + in-app purchases (mocked in the browser)
public/                 PWA manifest, service worker, icons
scripts/make-icons.mjs  Regenerates the app icons from the cell sprite
```

### Replacing the art
Every texture has a key (`cell`, `virus`, `boss`, `chest`, …). To use real art, load a PNG with the same key in `Boot.preload()` and remove that key from `pixelSprites.js`.

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
   npx cap init "Cell Defender" com.yourname.celldefender --web-dir dist
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

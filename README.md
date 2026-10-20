# Pixel Guard

A pixel-art monster defense shooter for phones, built with [Phaser 3](https://phaser.io) and Vite.

You are a little pixel guard holding the castle gate. Slide your finger to move: left and right, and up and down in the lower part of the screen to dodge the dragon's fireballs. You shoot automatically, and touching a monster hurts. Waves of monsters get stronger every wave.
- **Monsters:**
  - slimes and slow stone golems from level 1;
  - big slimes that split, and ghosts that sway slowly and take 3 hits (more in Haunted Halls and in Nightmare), from level 3;
  - fast bats that pop in one hit, and skeleton archers that shoot bones, from level 4;
  - an Ogre King (drops a treasure chest) in later waves;
  - Ogre Brutes and fire-spitting Dragon Whelps in the Monster Lairs.
- **Bosses:** the Red Dragon guards levels 1–10. Each Monster Lair has its own giant King: Slime King, Bat Queen, Ghost Lord, Golem Titan, Skeleton King, Ogre Warlord and Elder Dragon. Every boss has its own attacks: fireball fans, rings, meteor rain with red warning columns, charges and teleports. At half health (sooner in Nightmare) it gets **enraged**: it attacks faster and adds new attacks.
- **Health:** only **hearts** heal. A defeated monster sometimes drops one; it falls slowly and you have to catch it.
- **Level-ups:** kill monsters to level up. You get two level-ups in the first wave, then one about every wave and a half (Fast Learner in the shop gives more). Pick 1 of 3 upgrades. Each card shows exactly what changes, and maxed-out upgrades are never offered. These are stronger bolts or new **attack stances**: Fire Fan, Lightning Beam, Shield Orbit, Spirit Missiles and Shockwave. Each stance evolves at level 5.
- **Treasure chests:** catch the ones dropped by the Ogre King, or shoot them open, for extra upgrades.
- **Rewarded ads:** watch one to revive, double your coins, or reroll the cards. Once per run, an ad can also **TAKE ALL** the cards on a bonus screen. In the Android app, a short skippable ad also plays between some levels; buying anything in the store removes it.
- **17 levels:**
  - Meadow, Dark Forest, Crystal Cave, Murky Swamp, Scorched Desert, Ice Peaks, Volcano, Graveyard, Castle Ruins and Dark Realm;
  - then the 7 Monster Lairs: Slime Bog, Bat Caverns, Haunted Halls, Stone Quarry, Bone Crypt, Ogre Stronghold and Dragon's Peak.

  Monsters get tougher with every wave and every level.
- **Nightmare mode:** after level 10, spend 5000 coins to unlock hard versions of all levels.
  - Monsters don't adapt to your upgrades there, so every upgrade counts; the last Nightmare levels need an almost fully upgraded shop.
  - Coins are doubled, and the first clear of each level gives a big gem reward.
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
| `?debug` | All levels and Nightmare unlocked (saved – use RESET to undo), lots of currency, in-game SKIP / +LVL buttons |
| `?level=3` | Jump straight into level 3 (1–17) |
| `?nightmare` | With `?level=N`: Nightmare level N |
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
  art/variants.js       Kings / brute / whelp built from existing sprites (recolour + crown)
  data/                 Balancing lives here – edit numbers, not code
    enemies.js          Monster stats, bosses and their attacks
    pickups.js          Hearts (healing)
    levels.js           17 levels + Nightmare, wave sizes, difficulty curve, level-ups
    upgrades.js         In-run upgrade cards and attack stances
    shop.js             Permanent upgrades (coins / gems), monster adaptation
    store.js            Real-money packs (Google Play product ids)
    ads.js              AdMob ad unit ids, ads between levels
  scenes/               Boot, Menu, LevelSelect, Shop, Store, Game, LevelUp, Pause, Result
  systems/              WaveSpawner, BossBrain (boss attacks), SaveSystem (localStorage), Audio
  services/monetization.js   Ads + in-app purchases (AdMob / Google Play; mocked in the browser)
  services/native.js    Android-only setup (Back button, status bar)
public/                 PWA manifest, service worker, icons, privacy policy
android/                Android app project (Capacitor)
store/                  Google Play guide, store listing texts, graphics
scripts/make-icons.mjs  Regenerates the web + Android icons from the guard sprite
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

**Android / Google Play:** the Android app is a [Capacitor](https://capacitorjs.com) wrapper around the same game (the `android/` folder).
- **Building:** GitHub Actions builds it automatically (`.github/workflows/android.yml`), so Android Studio isn't needed.
  - Every push to `main` and every pull request produces a signed `.aab` (for Google Play) and an `.apk` (to install on a phone). They appear under **Artifacts** on the run's page.
  - Signing uses the upload key stored in the repository secrets.
- **Ads:** Google AdMob, via `@capacitor-community/admob`.
  - Rewarded ads are optional and give rewards.
  - A skippable ad appears between every 2nd or 3rd finished level; none after any purchase.
  - EU players see the consent form first.
  - Ad ids live in `src/data/ads.js`.
- **Payments:** Google Play Billing, via `cordova-plugin-purchase`. Products are listed in `src/data/store.js`, and the code is in `src/services/monetization.js`.
- **In the browser:** ads and payments are replaced by clearly labelled test dialogs.
- **Publishing:** step-by-step Play Console instructions, store texts and graphics are in [`store/`](store/PLAY_CONSOLE_GUIDE.md). The privacy policy is `public/privacy.html`.

To build it yourself instead, you need Android Studio, then:
```bash
npm run build && npx cap sync android && npx cap open android
```
`npm run icons` regenerates the web and Android icons from the guard sprite.

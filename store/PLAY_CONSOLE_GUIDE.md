# Publishing Pixel Guard on Google Play – step by step

Everything technical (building the app, ads, payments) is already in this repository.
These are the steps only you can do, because they need your Google accounts.

**Overview**
1. Create the accounts (now).
2. Add the signing key to GitHub (once).
3. Install the test app on your phone.
4. Create the app in Play Console and fill in the forms.
5. Internal testing: your first upload, in-app products, a test purchase.
6. AdMob: create the real ad units and send Claude the ids.
7. Closed test: 12 testers for 14 days (required for new personal accounts).
8. Apply for production and publish.

Product ids, texts and answers below must be typed **exactly** as written.

---

## 1. Accounts

1. **Support email:** `pixelguard.support@gmail.com` (done). It is shown publicly on Google Play and is
   already in the privacy policy and the store texts.
2. **Google Play Console** – https://play.google.com/console/signup
   - Choose **Yourself** (personal account), pay the **$25** one-time fee.
   - Verify your identity (ID card) and your phone and email. This can take a few days.
3. **AdMob** – https://admob.google.com. Sign up with the same Google account. Add your payment
   details later, when you earn money.

## 2. Signing key → GitHub secrets (once)

Google Play only accepts apps signed with your **upload key**. Claude generated it for you:
`pixel-guard-upload.jks` plus its password.

1. **Keep `pixel-guard-upload.jks` and the password safe** (e.g. in Google Drive and a password manager).
   Never commit it to the repository. If it is ever lost, Play Console → *Test and release → App integrity*
   lets you request a new upload key.
2. On GitHub open **waterdroid47/Game → Settings → Secrets and variables → Actions → New repository secret**
   and add these 4 secrets:

   | Name | Value |
   |------|-------|
   | `ANDROID_KEYSTORE_BASE64` | the whole content of `ANDROID_KEYSTORE_BASE64.txt` (one long line) |
   | `ANDROID_KEYSTORE_PASSWORD` | the password |
   | `ANDROID_KEY_ALIAS` | `pixelguard-upload` |
   | `ANDROID_KEY_PASSWORD` | the same password |

From now on every build is signed.

## 3. Get the app and install it on your phone

1. GitHub → **Actions** → **Android build** → the newest run on `main` (green ✓).
2. At the bottom, under **Artifacts**, download `pixel-guard-1.1.N`. It is a zip; unzip it:
   - `pixel-guard-1.1.N.aab` → this is what you upload to Google Play;
   - `pixel-guard-1.1.N.apk` → install this directly on your phone to try it.
3. Send the `.apk` to your phone and open it. Android asks to allow "Install unknown apps"; allow it.
4. While the test ad ids are in use, ads show a **"Test Ad"** label. This is expected.
   Purchases only work when the app is installed from Google Play (step 5).

> Later, before installing the Play Store version on the same phone, uninstall this APK first
> (Google Play signs its copy with a different key).

## 4. Create the app in Play Console

**Home → Create app**
- App name: `Pixel Guard: Monster Defense`
- Default language: English (United States) – en-US
- App or game: **Game** · Free or paid: **Free**
- Tick the declarations → **Create app**.

Then open **Dashboard** and complete every task under "Set up your app":

| Task | Answer |
|------|--------|
| **Privacy policy** | `https://stately-cupcake-10ac98.netlify.app/privacy.html` |
| **App access** | All functionality is available without special access |
| **Ads** | **Yes**, my app contains ads |
| **Content rating** | see [Content rating](#content-rating) below |
| **Target audience** | Ages **13–15, 16–17, 18+** (do **not** select under 13). "Could the store listing unintentionally appeal to children?" → **No** |
| **News app** | No |
| **Data safety** | see [Data safety](#data-safety) below |
| **Government app** | No |
| **Financial features** | My app doesn't provide any financial features |
| **Health** | My app does not have any health features |
| **Advertising ID** | **Yes**, the app uses the advertising ID. Purposes: Advertising or marketing, Analytics, Fraud prevention, security and compliance |
| **Store listing** | texts from [`listing.md`](listing.md), graphics from [`graphics/`](graphics/). Category: **Action**. Contact email = `pixelguard.support@gmail.com` |

### Content rating
Start the questionnaire (IARC). Email: `pixelguard.support@gmail.com`. Category: **Game**.
- Violence: **Yes**. Fantasy violence only: cartoon monsters, no blood, no realistic people.
- Fear / horror: No (cartoon ghosts and skeletons, not scary).
- Sexuality, language, drugs/alcohol/tobacco, crude humour: No.
- Gambling or simulated gambling: **No**. The treasure chests are earned in play; they can't be bought.
- Can users interact or exchange content? **No** · Shares the user's location? **No**
- Digital purchases? **Yes** · Ads? **Yes**

The expected result is about **PEGI 7 / ESRB Everyone 10+**.

### Data safety
The game itself sends nothing to us: progress is saved on the phone (and in the player's own Android
backup, if they have it turned on). The data below is collected by the **Google Mobile Ads SDK (AdMob)**.

- Does your app collect or share any of the required user data types? **Yes**
- Is all user data encrypted in transit? **Yes**
- Do you provide a way for users to request that their data is deleted? **No** (no accounts. Ad data is controlled in Google's ad settings, as explained in the privacy policy)

Data types to select (for each one: **Collected: yes**, **Shared: yes**, **Processed ephemerally: no**,
**Required** (users can't turn it off)):

| Data type | Purposes |
|-----------|----------|
| Location → **Approximate location** (from IP address) | Advertising or marketing, Analytics, Fraud prevention, security and compliance |
| App activity → **App interactions** | Advertising or marketing, Analytics, Fraud prevention, security and compliance |
| App info and performance → **Crash logs**, **Diagnostics** | Analytics, Fraud prevention, security and compliance |
| Device or other IDs → **Device or other IDs** | Advertising or marketing, Analytics, Fraud prevention, security and compliance |

Purchases go through Google Play's billing system, and the app doesn't send purchase data anywhere,
so "Financial info" is not selected.

## 5. Internal testing: first upload, products, test purchase

**First upload (manual, only this once):**
1. **Test and release → Testing → Internal testing → Create new release**.
2. Play App Signing: accept **"Use Google-generated key"** (recommended).
3. Upload the `.aab` from step 3. Release name: leave the default. Notes: "First test build".
4. **Next → Save and publish**.
5. **Testers** tab: create an email list with your own Gmail → save. Copy the **join link**, open it on
   your phone, accept, and install Pixel Guard from Google Play.

**Payments profile:** to sell items you need a merchant account: **Settings → Payments profile**
(Play Console will ask you to create one when you create the first product).

**In-app products:** **Monetize with Play → Products → One-time products → Create one-time product**.
Create these 5 products. For each one, add a purchase option (**Buy**), set the price (Play converts it
to other currencies) and **Activate** it:

| Product ID | Name | Description | Price (EUR) |
|------------|------|-------------|-------------|
| `starter_pack` | Starter Pack | 2000 coins and 100 gems. One time only. | 1.99 |
| `gems_small` | Pouch of Gems | 60 gems | 0.99 |
| `gems_medium` | Bag of Gems | 350 gems | 4.99 |
| `gems_large` | Chest of Gems | 800 gems | 9.99 |
| `coins_sack` | Sack of Coins | 6000 coins | 2.99 |

The ids can never be changed or reused, so check the spelling. The game treats `starter_pack` as one-time
(restored after a reinstall) and the other packs as consumable (they can be bought again). Any purchase
removes the ads between levels on that phone. After a reinstall Google Play only restores the Starter Pack
(and its ad removal), because it doesn't keep a record of consumed packs; Android's own backup, if the
player has it on, may also bring back the whole save.

**Test purchases without paying:**
1. **Settings → License testing**: add your Gmail (and your testers') → save.
2. In the Play Store version of the game, open **STORE**. The prices now come from Google Play.
   Buy something: Google shows a **test card** ("Test card, always approves"). Nothing is charged.
3. Check:
   - the gems/coins are added once;
   - buying the Starter Pack shows OWNED;
   - restoring: **Settings → Apps → Pixel Guard → Storage → Clear storage** (this skips Android's backup),
     open the game: the Starter Pack comes back by itself (or with **RESTORE PURCHASES**);
   - after any purchase, the ads between levels stop.

## 6. AdMob: real ads

1. https://admob.google.com → **Apps → Add app** → Android → "Is the app listed on a supported app store?"
   **No** for now (link it to Google Play later, once the app is public) → name `Pixel Guard`.
2. **Ad units → Add ad unit**:
   - **Rewarded**: name `Rewarded`, keep the default reward settings;
   - **Interstitial**: name `Between levels`.
3. **Privacy & messaging → European regulations (GDPR)** → create a message for Pixel Guard and **publish** it.
   This is the consent form that EU players see the first time they open the game. Without it, ads in the EU
   are very limited.
4. Send Claude these 3 ids:
   - **App ID**: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY` (with `~`);
   - **Rewarded ad unit ID**: `ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ` (with `/`);
   - **Interstitial ad unit ID**: `ca-app-pub-XXXXXXXXXXXXXXXX/WWWWWWWWWW` (with `/`).

   Claude puts them in `src/data/ads.js` and `android/app/src/main/res/values/strings.xml`.
5. Never tap your own real ads: AdMob can close accounts for that. Add your phone as a test device:
   **Settings → Test devices**.

New ad units can take an hour or more to start showing ads. "No ad available" right after creating them is normal.

## 7. Closed test: 12 testers × 14 days

New personal developer accounts must run a closed test with **at least 12 testers who stay opted in for
14 days in a row** before they can publish.

1. **Test and release → Testing → Closed testing → Create track** (or use the default "Alpha").
2. **Create new release** → **Add from library** (the build you already uploaded) or upload the newest `.aab`
   → save → **Send for review**. Google reviews it, usually within a few days.
3. **Testers**: create an email list with **at least 12–15 Gmail addresses** (friends and family; add a few
   more than 12 in case someone drops out).
4. Countries: select the countries where your testers live.
5. When the review is approved, send everyone the **join link** with the message below. Each tester must
   1) open the link and tap "Become a tester", 2) install the game from Google Play, and 3) **keep it
   installed for 14 days** (playing now and then helps).
6. Keep publishing updates to this track during the test. It shows Google that the app is being improved.

**Invite message (English)**
> Hi! I made a mobile game, **Pixel Guard**, and I need testers before it can go on Google Play 🙂
> 1. Open this link on your Android phone and tap "Become a tester": LINK
> 2. Install Pixel Guard from Google Play (same link).
> 3. Please keep it installed for at least 14 days, and play a bit when you can.
> Any feedback is welcome. Thank you!

**Mesaj de invitație (română)**
> Salut! Am făcut un joc pentru telefon, **Pixel Guard**, și am nevoie de testeri înainte să-l pot publica pe Google Play 🙂
> 1. Deschide linkul acesta pe telefonul Android și apasă „Devino tester": LINK
> 2. Instalează Pixel Guard din Google Play (același link).
> 3. Te rog să-l ții instalat cel puțin 14 zile și să te joci puțin când ai timp.
> Orice părere e binevenită. Mulțumesc!

## 8. Production

1. After 14 days with 12+ opted-in testers, **Dashboard → Apply for production** becomes available.
   Answer the questions about your test (who tested, what feedback you got, what you changed).
   Google replies in about 7 days.
2. Once approved: **Test and release → Production → Create new release** → add the newest build →
   countries: all (or the ones you want) → **Send for review**.
3. When it's live, link the app in AdMob (**Apps → App settings → Add app store details**).

## Updating the game later

1. Merge the changes into `main`.
2. GitHub Actions builds a new `.aab` with a higher version number (step 3).
3. Upload it to the track you want (Internal, Closed or Production) → create a release → roll out.

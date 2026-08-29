# Google Play listing checklist

FreshCart Android is in `android/`. Google still needs these from you before the app can go live.

## You must provide

1. **Google Play Console account** — one-time $25 developer registration.
2. **Package name** — currently `com.freshcart.android`. Change it in `app/build.gradle.kts` if you own a domain (for example `com.yourname.freshcart`). You cannot change this after the first upload.
3. **Production API URL** — `https://www.freshcarts.in` is set in `BuildConfig.API_BASE_URL`.
4. **Upload keystore** — create in Android Studio: Build → Generate Signed App Bundle. Keep the `.jks` / `.keystore` file and passwords private. Enable Play App Signing in Console.
5. **Privacy policy URL** — Play requires one. After you deploy the web app, use:
   `https://www.freshcarts.in/privacy`
   (already added on the website). Put this URL in the Play Console and in the store listing.
6. **Store listing**
   - App name (30 chars): FreshCart
   - Short description (80 chars)
   - Full description
   - Feature graphic: **1024 × 500** PNG
   - Phone screenshots: at least **2**, up to 8 (1080×1920 or similar)
   - High-res icon: **512 × 512** PNG (Play listing; the in-app adaptive icon is already in the project)
7. **Content rating** questionnaire (grocery delivery, no user-generated content).
8. **Data safety** form — the app stores a session cookie, name/email, cart, and addresses on device, and sends account + order data to your HTTPS API. No ads, no location permission.
9. **Target audience** and **news app** declarations (this is not a news app).

## Build the AAB

Signed Play files are generated locally (gitignored) at:

- `android/dist/freshcart.aab` — upload this to Google Play Console
- `android/dist/freshcart.apk` — for direct install / testing, not for Play

Rebuild:

```bat
cd android
gradlew.bat assembleRelease bundleRelease
```

Keep `android/upload-keystore.jks` and `android/keystore.properties` private. You need the same upload key for every future update.

Upload the `.aab` to a closed testing track first, then promote to production.

## Not included yet (optional later)

- Google Pay / UPI SDK (checkout currently uses the same UPI / CARD / WALLET options as the website)
- Push notifications for order status
- Maps for live rider tracking
- App signing by Play is recommended; do not commit keystores

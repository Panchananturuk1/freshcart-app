# FreshCart Android

Native Android client for the FreshCart grocery app. It uses Jetpack Compose and Material 3, talks to the live FreshCart API, and is structured for a Google Play upload.

## Open in Android Studio

1. Open **this `android/` folder** (not the Next.js repo root) in Android Studio.
2. Let Gradle sync. JDK 17 is required.
3. Run the `app` configuration on a phone or emulator (API 26+).

## Point at your backend

The release API URL is set in `app/build.gradle.kts`:

```kotlin
buildConfigField("String", "API_BASE_URL", "\"https://www.freshcarts.in\"")
```

Change that to your production domain before you ship. Product photos are loaded from `{API_BASE_URL}/images/products/...`.

Demo login: `jamie@example.com` / `freshcart123`.

## Release build for Play Console

```bash
./gradlew bundleRelease
```

On Windows:

```bat
gradlew.bat bundleRelease
```

The signed Android App Bundle is written to `app/build/outputs/bundle/release/`. You still need a upload keystore (see `PLAY_STORE.md`).

## What you need from your side

See `PLAY_STORE.md` for the Google Play listing, signing key, screenshots, and privacy policy.


# FI Investments App - Capacitor Build Instructions

This document provides instructions for building and deploying the FI Investments app to iOS and Android platforms.

## Prerequisites

- Node.js and npm installed
- For iOS: 
  - macOS computer
  - Xcode 13+ installed
  - iOS Developer Account
- For Android:
  - Android Studio installed
  - JDK 11+ installed

## Initial Setup

1. Clone the repository to your local machine
2. Install dependencies:
   ```
   npm install
   ```
3. Build the web app for production:
   ```
   npm run build
   ```

## iOS Build

1. Add iOS platform:
   ```
   npx cap add ios
   ```

2. Sync the web code with the native project:
   ```
   npx cap sync ios
   ```

3. Open the iOS project in Xcode:
   ```
   npx cap open ios
   ```

4. In Xcode:
   - Set up your Team for signing
   - Update Bundle ID if needed (matches the appId in capacitor.config.ts)
   - Configure app icons in Assets.xcassets
   - Update Info.plist with any required permissions

5. Build and run in Xcode to test on a simulator or device

## Android Build

1. Add Android platform:
   ```
   npx cap add android
   ```

2. Sync the web code with the native project:
   ```
   npx cap sync android
   ```

3. Open the Android project in Android Studio:
   ```
   npx cap open android
   ```

4. In Android Studio:
   - Update application ID in build.gradle if needed
   - Configure app icons in res/mipmap
   - Update AndroidManifest.xml with any required permissions

5. Build and run in Android Studio to test on an emulator or device

## TestFlight Preparation

1. In Xcode, ensure you have:
   - Valid certificates and provisioning profiles
   - Proper app version and build number
   - App icons and launch screen

2. Archive the app:
   - Select "Any iOS Device" as the build target
   - Choose Product > Archive
   - When archive completes, click "Distribute App"
   - Select "App Store Connect" and follow the prompts
   - Upload to App Store Connect

3. In App Store Connect:
   - Complete all required metadata
   - Add screenshots and app description
   - Set up TestFlight testing groups
   - Submit for TestFlight review

## Play Store Internal Testing

1. In Android Studio:
   - Generate a signed app bundle:
     - Build > Generate Signed Bundle/APK
     - Choose "Android App Bundle"
     - Create or select a key store
     - Complete the signing process

2. In Google Play Console:
   - Create a new app or select existing app
   - Upload the signed app bundle
   - Complete all required metadata
   - Set up internal testing track
   - Invite testers via email

## Updating the App

When updating the app:

1. Make changes to the web code
2. Build the web app:
   ```
   npm run build
   ```
3. Sync with native projects:
   ```
   npx cap sync
   ```
4. Open in respective IDE and rebuild/reupload

## Troubleshooting

- If changes aren't reflected, ensure you've run `npm run build` before `npx cap sync`
- Check Capacitor logs for any errors
- For iOS certificate issues, use Xcode's certificate manager
- For Android signing issues, check the keystore configuration


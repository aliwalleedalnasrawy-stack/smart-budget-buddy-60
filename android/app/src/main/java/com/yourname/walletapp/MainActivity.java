name: Build Android Debug APK
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Setup Java 17
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'

      - name: Install Dependencies
        run: npm install

      - name: Build Web Assets
        run: npm run build

      - name: Sync and Update Capacitor
        run: |
          npx cap update android
          npx cap sync android

      - name: Accept Android Licenses
        run: yes | sdkmanager --licenses

      - name: Grant Gradle Permissions
        run: chmod +x android/gradlew

      - name: Build with Gradle
        run: |
          cd android
          ./gradlew assembleDebug --stacktrace

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: app-debug-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk

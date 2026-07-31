# Firebase setup for shareable libraries

Word Search Creator Pro stores each person's library in Firestore under a secret library ID.
Sharing a link like `?library=<id>` lets others view and play that library.

## 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** and follow the prompts
3. Open **Build → Firestore Database → Create database**
4. Start in **production mode**, choose a region, and create

## 2. Add a web app

1. In Project Overview, click the **Web** icon (`</>`)
2. Register the app (nickname can be `word-search-creator-pro`)
3. Copy the `firebaseConfig` values

## 3. Set Firestore rules

In **Firestore → Rules**, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /libraries/{libraryId} {
      // Library IDs are unguessable UUIDs; anyone with the link can read/write that library doc.
      allow read, write: if libraryId.size() >= 32;
    }
  }
}
```

Publish the rules.

## 4. Local development

Copy `.env.example` to `.env.local` and fill in:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Then run:

```bash
npm install
npm run dev
```

## 5. GitHub Pages deploy secrets

In the GitHub repo: **Settings → Secrets and variables → Actions**, add secrets with the same names:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

The deploy workflow injects these at build time.

## How sharing works

- Each browser gets its own library ID (stored locally)
- Your puzzles sync to Firestore under that ID
- **Share my library** copies a URL containing your library ID
- Visitors can play puzzles; only your browser (the owner) can add or delete

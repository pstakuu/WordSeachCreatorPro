# Word Search Creator Pro

Create, play, and share personal word search libraries.

Live site: https://pstakuu.github.io/WordSeachCreatorPro/

## Features

- Create word searches with a name and word list
- Play by dragging across letters
- Save puzzles on this device
- Sync each personal library to the cloud (Firebase)
- Share your library with a link (viewers can play; only you can edit)

## Development

```bash
npm install
npm run dev
```

## Cloud sharing setup

Sharing requires a free Firebase project. See [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md).

Without Firebase config, the app still works and saves puzzles locally, but the share link cannot sync across devices.

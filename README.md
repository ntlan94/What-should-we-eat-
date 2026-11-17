# What Should We Eat? 🍕

Each person swipes yes or no on nearby restaurants, Tinder-style, and the app shows the match everyone agreed on. It ends the "I don't mind, you choose" loop.

## How it works

1. The host creates a room and gets a short room code.
2. Friends join with the code.
3. Everyone swipes through the same list of nearby restaurants.
4. When everyone swipes right on the same place, it's a match.

## Tech stack

| Part | What we use |
|---|---|
| Frontend | Plain JavaScript (ES modules), Tailwind CSS via CDN, no build step |
| Backend | Node.js + Express |
| Restaurant data | [Geoapify Places API](https://www.geoapify.com/places-api/) (free plan, no credit card) |

## Project structure

```
frontend/
  index.html            Entry page, loads src/app.js
  src/
    app.js              Main controller, switches between pages
    pages/              Home, SwipeRoom, Match screens
    components/         SwipeCard, Button, Navbar
    models/             User, Room
    services/           api.js (talks to backend), sync.js (real-time rooms)
    assets/             Global CSS and images

backend/
  server.js             Starts the Express server
  src/
    routes/             URL -> code (e.g. /api/restaurants)
    controllers/        Room and swipe request handlers
    services/           places.js (Geoapify), database.js
    models/             Restaurant.js (standard restaurant format)
```

## Getting started

You need [Node.js](https://nodejs.org/) 18 or newer.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env     # then open .env and paste your Geoapify key
npm start
```

Get a free key at [myprojects.geoapify.com](https://myprojects.geoapify.com/). Never commit `.env`; it is already in `.gitignore`.

The server runs at `http://localhost:3000`. Check it works:

```
http://localhost:3000/api/health
http://localhost:3000/api/restaurants?lat=51.5074&lng=-0.1278
```

### 2. Frontend

Browsers block ES modules on `file://` pages, so double-clicking `index.html` won't work. Serve the folder instead:

- **VS Code:** install the **Live Server** extension, right-click `frontend/index.html` → **Open with Live Server**, or
- **Terminal:** `npx serve frontend`

## API

### `GET /api/restaurants`

| Query param | Required | Description |
|---|---|---|
| `lat` | yes | Latitude of the search centre |
| `lng` | yes | Longitude of the search centre |
| `radius` | no | Search radius in metres (default `2000`) |
| `openNow` | no | `true` hides places known to be closed (unknown hours are kept) |

Returns up to 20 places, closest first:

```json
[
  {
    "id": "5184503981446ec0bf59...",
    "name": "Caffè Nero",
    "cuisine": "coffee_shop",
    "distance": 42,
    "address": "60-61 Trafalgar Square, London, WC2N 5DS, United Kingdom",
    "openingHours": "Mo-Fr 06:30-21:00; Sa 07:00-21:00; Su 07:30-20:00",
    "isOpenNow": true,
    "lat": 51.5072772,
    "lng": -0.1283651
  }
]
```

Geoapify has no photos or ratings, so the frontend shows a stock image based on `cuisine`. `openingHours` may be `null`. `isOpenNow` is `true`, `false`, or `null` when the hours are unknown (checked against the server's clock).

### `GET /api/geocode`

Turns a typed place name into coordinates for `/api/restaurants`.

| Query param | Required | Description |
|---|---|---|
| `text` | yes | Place name, e.g. `Camden` |

```json
{ "lat": 51.5427966, "lng": -0.1624803, "label": "Camden, London, ENG, United Kingdom" }
```

Returns `404` if nothing matches.

## Team

- Thanh Lan Ngo
- Jovian Niko Soesilo

## License

[MIT](LICENSE)

Restaurant data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, provided by [Geoapify](https://www.geoapify.com/).

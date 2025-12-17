# Letterboxd Higher or Lower

## What

**Letterboxd Higher or Lower** is a web-based game where users must choose which of two movies has a higher Letterboxd rating on a 0–5 star scale. Each round is timed, giving players **10 seconds per guess**, and scores increase with every correct answer.

Users can sign in with their Google account, compete on leaderboards, and test their movie knowledge across multiple difficulty levels.

---

## Why

This project is inspired by a game my friends and I used to play called _Higher or Lower IMDb_. However, my friends and I primarily use **Letterboxd** for tracking and rating movies.

Compared to IMDb, Letterboxd:

- Has a different user base
- Is less susceptible to large-scale review bombing
- Better reflects the type of movie culture we engage with

I also wanted to address a few design issues I had with the IMDb version:

- The IMDb game allows **ties**, where both movies have the same rating and the user’s choice doesn’t matter. In this version, ties are **eliminated**, ensuring every round has a definitive correct answer.
- The original game focuses heavily on very popular movies. By adding **difficulty levels**, users can challenge themselves beyond just mainstream films.

Overall, the goal was to build a more fun version of the game tailored to Letterboxd users.

---

## How

### Architecture

The application is built with a **Node.js + Express backend** and a **React frontend**.

- The backend is responsible for:

  - Validating guesses
  - Selecting replacement films
  - Managing timers, scoring, and difficulty logic
  - Anti cheating checks
  - Serving leaderboard data

- The frontend handles:

  - Game state and UI updates
  - Animations for rating reveals
  - Timer countdowns and user interactions

### Data Collection

Letterboxd does not provide a public API, so movie data was collected via **web scraping**:

- Used **Axios** and **Cheerio** to scrape over **11,000 movies**
- Data was gathered by analyzing the network requests used by Letterboxd’s popular pages
- Stored movie metadata including title, rating, and poster URL

All movie posters are stored in a **Cloudflare R2 bucket** for fast and reliable delivery.

### Caching & Performance

To ensure fast gameplay and responsive leaderboards:

- **Redis** is used to:

  - Cache all movie data on application startup
  - Cache active matches
  - Cache leaderboard results

- Leaderboards use eager loading for the top 10 scores per difficulty, creating an arcade-style high-score experience
- New scores update both:

  - Redis cache (hosted on Railway)
  - PostgreSQL database (hosted on Railway)

---

## Anti-Cheat & Game Integrity

Several measures are in place to ensure fair gameplay and prevent client-side manipulation:

- All guesses, score increments, and rating comparisons are **validated on the backend**
- Game actions are tied to a **signed session token** issued by the backend
- Only authenticated Google accounts can submit scores to leaderboards
- The frontend does **not** reveal movie ratings or scores until a guess has been submitted
- Final score submissions are verified against backend game state before being persisted

---

## Guest Games & Session Persistence

To improve the user experience for non-logged-in players:

- Games played while logged out are stored in **Redis for up to 10 minutes**
- If a user logs in within this window, their most recent game can be **linked to their account**
- This allows users to save a high score even if they choose to authenticate after finishing a session

---

## Responsive Design

The interface is designed to work smoothly across a range of devices:

- Fully responsive layout supporting **mobile, tablet (iPad), and desktop** screen sizes
- Touch-friendly interactions for mobile users
- UI components adapt dynamically to different resolutions to maintain usability and visual clarity

### Authentication

- User authentication is handled via **Google OAuth**
- Logged-in users can:

  - Submit scores
  - Appear on leaderboards
  - Persist progress across sessions

---

## Tech Stack

**Frontend**

- React
- TypeScript
- Tailwind CSS
- ShadCN UI

**Backend**

- Node.js
- Express
- PostgreSQL (Railway)
- Redis

**Infrastructure**

- Cloudflare R2 (poster storage)
- Google OAuth

---

## Features

- Timed higher-or-lower gameplay (10 seconds per round)
- Backend-validated guesses to prevent client-side cheating
- Difficulty-based movie pools
- Backend check to prevent ties for movie ratings
- Google account login
- Redis-backed leaderboards
- Persistent high scores

---

## Challenges & Learnings

- Designing game logic that prevents ties while keeping comparisons fair
- Working around the lack of a public Letterboxd API
- Making ui screen height and width responsiveness
- Coordinating frontend animations with backend-driven state changes
- Database optimization, RANDOM() vs OFFSET

---

## Future Improvements

- It would be awesome if there was a "battle mode" you could invite your friends to play the same set of choices.

---

## Disclaimer

This project is for educational purposes only and is not affiliated with or endorsed by Letterboxd.

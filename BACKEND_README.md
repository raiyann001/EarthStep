# EarthStep — Backend Guide

Connected to your real Firebase project (`eartstep`). Design/UI is untouched —
this only covers what's now running for real underneath it.

## 1. One-time Firebase Console setup
1. **Authentication → Sign-in method** → enable **Email/Password** and **Google**.
2. **Firestore Database → Rules** → paste `firestore.rules` from this project → **Publish**.
   (Required — without it every read/write is denied by default.)
3. To make yourself an admin: sign up normally on the site, then in
   **Firestore Database → users → (your uid)**, manually change the `role`
   field from `"user"` to `"admin"`. This can only be done in the console —
   never from the site itself, on purpose (security).
4. Add at least one challenge from `/admin.html` (or directly in Firestore)
   so the homepage has something to show — see below.

## 2. What's real now
| Feature | Where | Notes |
|---|---|---|
| Sign Up / Login / Logout | `signup.html` / `login.html` | Firebase Auth |
| Forgot Password | `forgot-password.html` | Real reset email |
| Email Verification | `signup.html`, `profile.html` | Sent on sign-up; resend banner if unverified |
| Google Sign-In | login/signup pages | Creates profile on first use |
| User profile in Firestore | `users/{uid}` | fullName, username, email, level, xp, earthHealth, completedChallenges, streak, joinedDate, badges, role |
| Daily Challenges | homepage `#challengeList` | Reads `challenges` collection, deterministic daily pick of 3 |
| Complete Challenge → XP/Health/Streak | homepage | Real Firestore transaction, one completion per challenge per day |
| Badge auto-unlock | on challenge completion | Rules live in `assets/js/challenges.js` → `BADGE_RULES` |
| Leaderboard | `leaderboard.html` | 4 real rankings from `users` collection |
| Admin Panel | `admin.html` (unlinked — visit directly) | Challenges CRUD, view users, announcements, badge catalog, basic analytics |

## 3. Adding challenges (so the homepage isn't empty)
Go to `/admin.html` (you must be signed in as an admin — see step 3 above)
→ Challenges tab → fill the form → Create Challenge. Add 3+ for the daily
rotation to kick in; with fewer than 3 active challenges, all of them show
every day.

## 4. Data model reference
```
users/{uid}
  uid, fullName, username, email, profilePhoto, level, xp, earthHealth,
  completedChallenges, streak, joinedDate, badges[], role, lastActiveDate

users/{uid}/completions/{YYYY-MM-DD}
  date, completedChallengeIds[]

challenges/{id}
  title, description, category, difficulty, xpReward, estimatedTime,
  active, createdAt

announcements/{id}
  title, body, createdAt

badges/{id}
  name, condition, createdAt
```

## 5. Known limitations (being upfront)
- **"Reset Challenges"** in the admin panel deactivates all challenges —
  a true per-user "reset today's progress" would need a Cloud Function
  (this is a static site with no server, so that's out of scope here).
- **Analytics tab** shows basic live counts from Firestore, not full
  Firebase Analytics (traffic, funnels, etc.) — see the Firebase Console
  for that.
- **Badge catalog** in the admin panel is for reference/display; the
  actual unlock thresholds are code (`BADGE_RULES` in `challenges.js`) —
  update both together if you change a condition.

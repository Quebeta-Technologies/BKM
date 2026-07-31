# For Her ♥

A one-page love letter, built as a website. Locked behind a password only she knows.

---

## 1. Run it on your computer

You need [Node.js](https://nodejs.org) installed (any version 18 or newer).

Open a terminal in this folder and run:

```bash
npm install
npm run dev
```

Then open the link it prints — usually `http://localhost:5173`.

---

## 2. Make it yours

**Everything you need to edit is in one file: `src/data.js`.**

Open it, change the words, save. The page updates instantly while `npm run dev` is running.

| What | Where in `src/data.js` |
|---|---|
| Her name | `HER_NAME` |
| Your sign-off | `YOUR_SIGNOFF` |
| The password + question | `LOCK` |
| The song | `SONG` |
| The four dates and their stories | `MILESTONES` |
| The sealed letters | `LETTERS` |
| The little things you love | `REASONS` |
| Your first WhatsApp chat | `CHAT` |
| Photos | `PHOTOS` |
| The closing letter | `FINALE` |

### The password

It's currently `10082025` — the day you first said hi, as `ddmmyyyy`.
Spaces, slashes, dashes and capitals are all ignored, so `10/08/2025` works too.
To remove the lock entirely, set `enabled: false`.

### The song

Put an mp3 in the `public` folder and name it **`song.mp3`**. That's it.
It fades in the moment she unlocks the page, loops forever, and she can pause it
with the button in the bottom-right corner.

If there's no file there, the music button simply doesn't appear — nothing looks broken.

> Use a song that's actually yours. If you don't have the file, a 30–60 second
> instrumental works beautifully and keeps the page light.

### Photos

Drop images into `public/photos/`, then point to them in `data.js`:

```js
{ src: "/photos/first-date.jpg", caption: "25.12.25", tilt: -2 },
```

Portrait photos look best. Six is the sweet spot, but add as many as you like.

---

## 3. Put it online

**Vercel** (free, takes about two minutes):

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
3. Vercel detects Vite automatically. Just click **Deploy**.

**Netlify:** drag the `dist` folder (created by `npm run build`) onto
[app.netlify.com/drop](https://app.netlify.com/drop).

Either way you'll get a link you can send her on WhatsApp. The link preview
says *"Something I made for you"* — you can change that in `index.html`.

---

## What she'll walk through

1. **The lock** — a question only she can answer
2. **The hero** — a counter ticking every second since 9:14pm, 10 Aug 2025
3. **The constellation of us** — your four dates as stars, drawn as she scrolls, each one clickable
4. **The night it started** — your first chat, replaying itself, typing dots and all
5. **Four sealed letters** — for today, for sad days, for missing you, for ten years from now
6. **Reasons** — shuffled one at a time
7. **Moments** — polaroids
8. **The last page** — the real letter, and a button that fights back

Hearts float up wherever she taps. Anywhere on the page.

---

## A note on making it land

The site is built. The part that matters is the writing, and I wrote it blind.

If you change nothing else, change these two things:

- **`CHAT`** — put your real first messages in. She will recognise them instantly, and that's the moment the whole thing stops being a website and starts being *yours*.
- **One letter** — rewrite at least one in your own voice. Slightly awkward and true beats polished and generic, every single time.

Send it late at night. It reads better in the dark.

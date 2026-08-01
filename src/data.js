/* ═══════════════════════════════════════════════════════════════════════════
   ❤  THIS IS THE ONLY FILE YOU NEED TO EDIT.  ❤
   Change the words here and the whole site changes.
   Nothing will break as long as you keep the quotes and commas where they are.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── 1. WHO ──────────────────────────────────────────────────────────────── */

export const HER_NAME = "Rimi"; // her name, or your nickname for her
export const YOUR_SIGNOFF = "Your Biki"; // how you sign your letters

/* ── 2. THE LOCK ─────────────────────────────────────────────────────────── */
/* Only she should be able to open this. Pick something only she'd know.     */

export const LOCK = {
  enabled: true, // set to false to remove the password screen entirely
  password: "10082025", // the answer (spaces, slashes and case are ignored)
  question: "The day i first said hi to you.",
  hint: "ddmmyyyy",
  wrongMessages: [
    "That's not it. Think about August.",
    "Close. But you know this one.",
    "Try again. I'll wait I'm good at waiting for you.",
    "Still no. Scroll up in our chat if you have to. I won't judge.",
  ],
};

/* ── 3. OUR SONG ─────────────────────────────────────────────────────────── */
/* Put an mp3 file in the `public` folder and name it song.mp3.             */
/* If there's no file, the music button just quietly disappears.            */

export const SONG = {
  file: "/song.mp3",
  title: "our song",
  volume: 0.32, // 0 to 1
  autoplay: true, // starts the moment she unlocks the page
};

/* ── 4. WHEN IT ALL STARTED ──────────────────────────────────────────────── */
/* Used for the live counter on the first screen.                           */

export const START = "2025-08-10T21:14:00";
export const START_LABEL = "counting since 9:14 pm, 10 august 2025";

/* ── 5. OUR FOUR DATES ───────────────────────────────────────────────────── */
/* x / y are the star positions in the constellation. Leave them alone      */
/* unless you add or remove a date — then nudge them to taste (0–800, 0–400).*/

export const MILESTONES = [
  {
    id: "hello",
    date: "2025-08-10",
    label: "The first hello",
    where: "WhatsApp, two blue ticks",
    x: 92,
    y: 300,
    text:
      "One message. That's genuinely all it took. I typed it, deleted it, typed it again, and hit send before I could talk myself out of it. You replied, and something in my chest went quiet in a way it hadn't in years. I didn't know it yet, but that little grey bubble on 10 August was the first day of the best thing that has ever happened to me.",
  },
  {
    id: "meet",
    date: "2025-08-24",
    label: "The first time I saw you",
    where: "In person, finally",
    x: 252,
    y: 148,
    text:
      "Fourteen days of talking, and then you walked in. I had imagined it about a hundred times and I still got it wrong, because nothing I imagined had your laugh in it. I remember thinking, very calmly and very clearly: oh no. Oh no, I'm going to love this person.",
  },
  {
    id: "date",
    date: "2025-12-25",
    label: "Our first date",
    where: "Christmas Day",
    x: 470,
    y: 96,
    text:
      "Of every day in the year, we picked the one the whole world already keeps for the people it loves. You looked so beautiful I forgot half of what I'd planned to say. We stayed out longer than we meant to. Every Christmas from now on has a second meaning for me, and it's you.",
  },
  {
    id: "kiss",
    date: "2026-01-01",
    label: "Our first kiss",
    where: "The very first page of the year",
    x: 690,
    y: 252,
    text:
      "A whole new year, and the first thing in it was you. I'm not going to try to describe it, because words go a bit useless around it. I'll just say this: whatever the rest of 2026 decides to do, it opened with the best moment of my life, and I got to be there for it.",
  },
];

/* ── 6. THE SEALED LETTERS ───────────────────────────────────────────────── */
/* Add as many as you like. Each `body` is a list of paragraphs.            */

export const LETTERS = [
  {
    id: "l1",
    seal: "For you, today",
    title: "Happy Girlfriend's Day",
    body: [
      "I'm not good at saying this out loud without my voice doing something embarrassing, so I built you a whole website instead. That's probably the most honest thing about me you'll read all day.",
      "Here's what I actually wanted to say: you did not just become my girlfriend. You became my favourite part of every ordinary day. The 11pm calls. The voice notes I replay when you're asleep. The way you say my name when you're annoyed at me, which is somehow still my favourite sound.",
      "You are not a chapter of my life. You're the handwriting.",
    ],
  },
  {
    id: "l2",
    seal: "Open when you're sad",
    title: "Read this on the bad days",
    body: [
      "First: you're allowed. You don't have to be the strong one today. Not with me. Put it down.",
      "Second: nothing you are feeling right now is bigger than how much I love you. I've checked. I keep checking. It never is.",
      "Third: I'm not going anywhere. Not when you're quiet, not when you're difficult, not when you're convinced you're too much. You have never once been too much. You have only ever been exactly enough, and then a little extra for luck.",
      "Come here. I've got you.",
    ],
  },
  {
    id: "l3",
    seal: "Open when you miss me",
    title: "I miss you too. Constantly.",
    body: [
      "Right now, wherever I am, I have almost certainly just picked up my phone to tell you something small and pointless. That's the whole shape of missing you — it isn't dramatic, it's a hundred tiny interruptions a day.",
      "I miss the way you fall asleep on video calls and get defensive about it. I miss you stealing food off my plate after saying you weren't hungry. I miss the pause before you laugh.",
      "Distance is just a number of hours, and I have counted every one of them, and every single one has been worth it.",
    ],
  },
  {
    id: "l4",
    seal: "Open in ten years",
    title: "Hi. It's me, from the beginning.",
    body: [
      "If you're reading this, we made it further than the part where everything was new and easy. Good. I hoped we would.",
      "I want you to know that the person writing this — the one who was nervous on 24 August 2025, who couldn't sleep after our first date — already knew. Not the details. Just you.",
      "So whatever the last ten years put us through: thank you for staying. Thank you for the life. I'd choose the exact same thing again, right from that first message.",
    ],
  },
];

/* ── 7. THE LITTLE THINGS ────────────────────────────────────────────────── */
/* Add as many as you want. The site counts them automatically.             */

export const REASONS = [
  "The way you laugh a half-second before the funny part.",
  'How you say "one minute" and mean twenty, and I never mind.',
  "That you check on people who never check on you.",
  "Your voice notes. All of them. Even the four-minute ones.",
  "How you get genuinely excited about very small things.",
  "That you remember what I told you once, months ago, offhand.",
  "The face you make when you're concentrating.",
  "How you fall asleep on calls and deny it the next morning.",
  "That you're kind to people who can do nothing for you.",
  "Your handwriting. Objectively terrible. Deeply loved.",
  "How you argue with me and are usually right.",
  "The way you look at me when you think I'm not looking.",
  "That you make ordinary Tuesdays feel like something.",
  "How safe it is to tell you the truth.",
  "Your terrible taste in movies and excellent taste in me.",
  "That you never let me go to sleep upset.",
  "How you hold my hand a little tighter in crowds.",
  "The way you hum when you're happy and don't notice.",
  "That you believed in me before there was evidence.",
  "How you say my name. Just that. How you say it.",
  "That you dance in the kitchen when you think nobody's watching.",
  "Your patience with me on the days I don't deserve it.",
  "How you make me want to be a better version of this.",
  "That out of everyone, you picked me back.",
];

/* ── 8. OUR FIRST CONVERSATION ───────────────────────────────────────────── */
/* Replace these with your REAL first messages. This is the part that will  */
/* wreck her. from: "me" or "her". Use type: "voice" for a voice note.      */

export const CHAT = [
  { from: "me", text: "Hey 👋 I hope this isn't weird… I've been meaning to message you all day.", t: "9:14 pm" },
  { from: "her", text: "not weird at all 😄 I was kind of hoping you would", t: "9:16 pm" },
  { from: "me", text: "Okay good. I had a whole backup plan if you'd said it was weird.", t: "9:16 pm" },
  { from: "her", text: "now I need to hear the backup plan", t: "9:17 pm" },
  { from: "me", text: "Absolutely not. Ask me again in a year.", t: "9:17 pm" },
  { from: "her", text: "a year 😏 confident", t: "9:18 pm" },
  { from: "me", type: "voice", dur: "0:47", t: "9:22 pm" },
  { from: "her", text: "okay. okay I'm smiling. this is your fault", t: "9:31 pm" },
];

/* ── 9. PHOTOS ───────────────────────────────────────────────────────────── */
/* Drop images into public/photos/ then point to them here.                 */
/* Leave src as null for a placeholder. tilt is the rotation in degrees.    */

export const PHOTOS = [
  { src: null, caption: "the first one",      tilt: -4 },
  { src: null, caption: "you, mid-laugh",     tilt:  3 },
  { src: null, caption: "25.12.25",           tilt: -2 },
  { src: null, caption: "us, no reason",      tilt:  5 },
  { src: null, caption: "your favourite",     tilt: -5 },
  { src: null, caption: "2.13 am",            tilt:  2 },
  { src: null, caption: "the look",           tilt: -3 },
  { src: null, caption: "01.01.26",           tilt:  4 },
  { src: null, caption: "you didn't know i took this", tilt: -6 },
  { src: null, caption: "sunday morning",     tilt:  1 },
  { src: null, caption: "my favourite",       tilt: -4 },
  { src: null, caption: "just because",       tilt:  3 },
];

/* ── 10. THE LAST PAGE ───────────────────────────────────────────────────── */

export const FINALE = {
  heading: ["I don't need a day on a calendar", "to know what you are to me."],
  paragraphs: [
    "But I'll take the excuse. Because there are things I don't say often enough, and today I get to say all of them at once.",
    "You are the best thing that has happened to me. Not the most exciting, not the most dramatic — the best. The kind of good that shows up in ordinary weeks and quietly makes them worth remembering.",
    "Thank you for replying that night. Thank you for every day since. Thank you for being someone I get to be completely, unglamorously myself around.",
  ],
  closing: "Happy Girlfriend's Day, my love. You are so, so wildly loved.",
  buttonLines: [
    "Press it. I dare you.",
    "Again.",
    "Okay, you're enjoying this.",
    "I could do this all day.",
    "Still nowhere close to how much.",
    "Genuinely, I'm running out of hearts.",
    "Fine. You win. I love you the most.",
  ],
};

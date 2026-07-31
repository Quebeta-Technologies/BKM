import React, { useEffect, useRef, useState } from "react";
import { SONG } from "../data.js";

/**
 * Plays SONG.file on a loop, fading in gently.
 * If the file isn't there, this component renders nothing at all —
 * so the site never looks broken just because you haven't added a song yet.
 */
export default function MusicToggle({ start }) {
  const audio = useRef(null);
  const [available, setAvailable] = useState(true);
  const [playing, setPlaying] = useState(false);

  // Fade the volume up instead of slapping her in the ears.
  const fadeIn = (el) => {
    el.volume = 0;
    let v = 0;
    const step = setInterval(() => {
      v = Math.min(SONG.volume, v + SONG.volume / 30);
      el.volume = v;
      if (v >= SONG.volume) clearInterval(step);
    }, 60);
  };

  const play = () => {
    const el = audio.current;
    if (!el) return;
    el.play()
      .then(() => {
        fadeIn(el);
        setPlaying(true);
      })
      .catch(() => setPlaying(false)); // browser blocked it — she can tap the button
  };

  // Unlocking the page counts as a tap, so autoplay is allowed here.
  useEffect(() => {
    if (start && SONG.autoplay) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  const toggle = () => {
    const el = audio.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      play();
    }
  };

  if (!available) return null;

  return (
    <>
      <audio
        ref={audio}
        src={SONG.file}
        loop
        preload="auto"
        onError={() => setAvailable(false)}
      />
      <button
        className={`music ${playing ? "playing" : ""}`}
        onClick={toggle}
        aria-label={playing ? "Pause our song" : "Play our song"}
      >
        <span className="eq" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        {playing ? SONG.title : "play our song"}
      </button>
    </>
  );
}

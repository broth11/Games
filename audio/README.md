# Audio

One subfolder per `gameType`, mirroring the game folders at the repo root.
A game's `host.html` points at these with `../audio/<game-type>/<file>.mp3`.

**Everything currently in here is a synthesized placeholder.** They are correct
in format and loop seamlessly, but they are plain tones — fine for verifying the
wiring works, not fine for a real class. Replace them.

## Replacing a placeholder

Keep the same filename and nothing else needs to change. If you rename a file,
update the `music` config in that game's `host.html`.

Target specs:

- **MP3, 128kbps, mono.** Every browser you'll meet in a classroom plays MP3
  natively — no need for OGG fallbacks. Mono halves the file size and stereo
  width is wasted on a ceiling projector speaker.
- **Under ~1-2MB each**, which at 128kbps is roughly 60-90 seconds. It loops, so
  longer buys very little.
- **Trim to a clean loop point.** Most free tracks have a fade-out at the end
  that clicks audibly on repeat. Open it in Audacity, cut to a bar boundary, and
  check it by looping it a few times before committing.

## Where to get tracks

- **incompetech.com** (Kevin MacLeod) — huge library, CC-BY. Credit him in a
  footer somewhere and you're clear.
- **Pixabay Music** and **Free Music Archive** — filter by license; some need no
  attribution at all.
- **OpenGameArt** — smaller selection, but the tracks are written to loop, which
  most "free music" is not.
- **freesound.org** — better for short stingers than full beds.

Whatever the license, note it here so the next person isn't guessing.

## Which phase gets which file

Config keys must match what `Engine.session.derivePhase()` returns:
`idle` (between rounds / lobby), `countdown`, `live`, `ended`. A phase left out
of the config is silence — `ended` is currently omitted for Skew the Feed so the
results podium is read in quiet.

## Volume

The engine plays at 0.35 and fades over 450ms. If that's still too loud through
your room's speakers, change `MUSIC_VOLUME` in `engine.js` rather than
re-encoding the files — it's one constant and it applies to every game.

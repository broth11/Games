# Plot Twist

AP Statistics Unit 1A + 1B · Ladder template · fourth classroom game.

## Classroom installation

Copy the entire `plot-twist` folder into the Games repository / local push folder beside the existing three game folders. Keep its `runtime`, `audio-b`, and other files together. This addition does not replace any existing game's files or backend.

The downloadable classroom package sets `preview: false` in `config.js`. It uses the supplied Apps Script `/exec` URL and your roster. Check that URL against your current deployment before your first class. The game type is `plot-twist`. Your supplied shared Apps Script actions and four sheet tabs support this game without adding columns or deploying a replacement backend.

Open `plot-twist/host.html`, create a room, and have students open `plot-twist/index.html`. Students enter the four-character room code and their existing ID. The host defaults to 10 minutes, with 3/5/8/10-minute presets. Use the host's sound button to enable music. Let the full timer expire for the confirmed-results podium and fanfare; an early stop shows a summary instead.

The separate private preview uses local browser rooms and sample IDs. That configuration is not used in this classroom download. Never replace the classroom `config.js` with the private preview configuration.

## Reading and play

44 original scenarios, each with three decisions: 132 questions covering all eleven supplied lessons. One visual remains visible throughout each ladder. Brief explanations stay until Next is pressed; wrong answers do not lock later questions. Every correct answer earns 10 points, with no time or streak bonus. Class scoring still rewards completing more decisions within the round, so allow ample time.

Untimed practice (`index.html?practice=1`) needs no roster ID, never sends scores, and offers all lessons or one lesson at a time. A timed round samples the bank; it does not guarantee that every student reaches every topic. See `coverage.md` for the map and AP interpretation safeguards. Follow selected questions with spoken or written justification: selected-response play does not replace AP free-response practice.

## Assets

Logo: original AI-generated Plot Twist artwork created for this game.
Music: “In the Lobby” by Umplix; “Cyberpunk Moonlight Sonata” by Joth; supplied ecosystem assets attributed to OpenGameArt, CC0. Reused normalized tracks with overlapping loops and fades. Fanfare: original synthesized ecosystem cue. Music plays on the teacher host only.

## Verification and limits

Automated simulated-DOM checks exercised all 132 practice decisions, answer locking, room entry, full timed completion, saving, podium, fanfare-once behavior, and live mode hiding demo controls. Independent arithmetic checks cover mean, sample SD, percentages, fences and z-scores. The existing three-game lifecycle and backend test suites also passed. This has not been load-tested against your live spreadsheet with a full class or checked on actual student devices. Preview tests did not write to your classroom backend.

## Visual and sound update

Added precise SVG graphics for Axis of deception, Lunch vote, Parts of a whole, Aim and scatter, and Two rules. The remaining graph-dependent cases already render their dotplots, histogram, stem-and-leaf table, or boxplots. Conceptual study-design cases retain compact evidence cards. Graphics have descriptive text alternatives and do not depend on color alone.

Music belongs to the teacher host, including during solo previews. Use “Teacher host + music” on the student screen to open the same room, then click “Enable sound” on the host. Keep that host tab open. Practice and student pages are intentionally silent. The host now correctly distinguishes audio that still needs activation, and enabling sound restores playback from a previously muted session.

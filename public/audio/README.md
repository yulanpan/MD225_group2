# Audio Asset Placement

Place generated music and sound effects in this directory using the exact filenames below. The game will try to play these paths directly.

## Core Music

- `bgm/title-theme.mp3`
- `bgm/dashboard-base.mp3`
- `bgm/archive-loop.mp3`
- `bgm/dialogue-tension.mp3`
- `bgm/pne-intro.mp3`
- `bgm/ending-contained.mp3`
- `bgm/ending-collapse.mp3`
- `bgm/ending-liberation.mp3`

## Adaptive Layers

- `layers/truth-layer.mp3`
- `layers/pressure-layer.mp3`
- `layers/suspicion-layer.mp3`
- `layers/public-doubt-layer.mp3`
- `layers/liberation-layer.mp3`

The first batch of Gemini prompts only asks for `pressure-layer.mp3` and `suspicion-layer.mp3`. The other three layer files can be added later, or duplicated from a quiet compatible texture until custom versions exist.

## Sound Effects

- `sfx/ui-hover.mp3`
- `sfx/ui-click.mp3`
- `sfx/action-commit.mp3`
- `sfx/engine-scan.mp3`
- `sfx/engine-intro-hit.mp3`
- `sfx/dialogue-open.mp3`
- `sfx/dialogue-message.mp3`
- `sfx/metric-shift.mp3`
- `sfx/fragment-unlock.mp3`
- `sfx/achievement-unlock.mp3`
- `sfx/ending-trigger.mp3`

Keep SFX short, dry, and lower-volume than the music. The runtime volume mixer will apply final levels.

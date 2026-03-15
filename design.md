# Thread Architecture

## Data flow
1. `rootNode` is serialized from JS into a UI-thread worklet closure once at startup.
2. `useDerivedValue` runs `computeLayout` on the UI thread — single source of truth for layout.
3. Gesture events (pan start/update) run entirely on the UI thread: hit detection reads `uiLayoutNodes.value`, updates `focusedId.value` directly.
4. `useAnimatedReaction` detects focus changes and calls `runOnJS(setLayoutNodes)` to ship the already-computed nodes to React for re-rendering.

JS is only touched when the focused node changes — not on every gesture event.

## Why layout lives on the UI thread
Hit detection needs layout. If layout lived on JS, every gesture event would require a JS → UI → JS round trip. Running layout on the UI thread eliminates that entirely. The result is forwarded to JS (rather than recomputed there) to avoid duplication.

## Files
- `features/notes/layout.ts` — `computeLayout` + `findPath`, both marked `'worklet'`
- `features/notes/Notes.tsx` — shared values, derived layout, gesture handler, reaction sync

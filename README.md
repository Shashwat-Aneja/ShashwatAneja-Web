# Shashwat Aneja Portfolio V14

Personal portfolio built as an editorial interactive Field.

## Run locally

This is a static site. Open `index.html` directly or serve the folder with any static HTTP server.

Example:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/`.

## Structure

- `index.html` - complete portfolio homepage
- `projects/index.html` - project archive support page
- `css/` - original V13 styles plus V14 Field layer
- `js/` - original V13 scripts plus V14 Field controller
- `assets/` - original portfolio assets
- `V14-ARCHITECTURE.md` - architecture and interaction contract

## V14 Field

01 Identity → 02 Introduction → 03 What I Make → 04 Selected Work → 05 Workspace → 06 Experiments → 07 Currently → 08 How I Think → 09 Journey → 10 Notes → 11 About → 12 Contact

The Studio/service site is intentionally not linked from this version.

## V18 production architecture
- `js/projects-data.js` is the source of truth for the project catalogue and selected-project deep-dive metadata.
- `js/notes-data.js` is the seed for future Notes content.
- `/projects/` is an indexable archive of the five featured deep dives.
- Each featured deep dive has canonical, Open Graph, Twitter card and JSON-LD metadata.


## V19 Final production pass

- Workspace remains locked.
- Removed orphan placeholder project routes.
- Added the manifest referenced by the homepage.
- Marked the 404 route as noindex.
- Added theme metadata for browser chrome.
- Preserved the V18 content and visual system.

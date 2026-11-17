# A Garden of Little Things

A personalised, floral, six-stage interactive website. Plain HTML, CSS and vanilla JavaScript. No build step, no backend, no paid services.

**Status: Iteration 1 of 6.** Stage 1 (Welcome) and a basic Stage 2 (Garden) are complete.

## Project structure

```
index.html        Page structure, SVG flower sprite, the Welcome and Garden stages
style.css         Design tokens, layout, components, animations, responsive rules
main.js           App logic: visitor session, StageManager, navigation, Welcome + Garden
interactions.js   Reusable helpers: floating petals, petal burst, toast, flower bed
content.js        ALL editable text and placeholders (the only file you need to edit)
assets/images/    Put family photographs here (used from Stage 3 onwards)
assets/audio/     Put the optional music file here (used in Stage 6)
```

## Run it locally

**Easiest:** double-click `index.html`. It opens in your browser.

**Recommended (closest to a real website):** run a tiny local server from this folder, then visit http://localhost:8000.

```bash
# Python 3 (already installed on most Macs / Linux machines)
python3 -m http.server 8000

# or, with Node.js
npx serve .
```

To preview on your phone, connect it to the same Wi-Fi and open `http://<your-computer's-IP>:8000`.

## Deploy as a static website (free)

Upload the whole folder to any static host: **Netlify Drop** (drag and drop the folder), **GitHub Pages**, **Cloudflare Pages** or **Vercel**. Share the resulting link with the family.

## Editing the content

Open `content.js`. Change text between the quotation marks. `{name}` becomes the visitor's name. Anything marked `[PLACEHOLDER ...]` is waiting for real information.

> Note: `content.js` is visible to anyone who views the page source. The final-stage text is kept as placeholders until that stage is built.

## Extending (adding stages 3-6)

1. Add a `<section class="stage" data-stage="N" inert>` to `index.html`.
2. Add its styles to `style.css`.
3. Register it in `main.js`: `StageManager.register({ order: N, onEnter() { ... } })`.
4. The navigation dots, back button, transitions and browser history pick it up automatically.

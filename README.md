# Sudip Kumar Sah — Portfolio

Cinematic IT portfolio with universe background, GSAP animations, and Three.js.

## Project Structure

```
sudip-portfolio/
├── index.html                    ← Root redirect to pages/index.html
├── README.md
│
├── assets/
│   ├── images/
│   │   ├── logo-silver.png       ← Nav + footer logo
│   │   └── logo-gold.png         ← Loader + profile card logo
│   └── fonts/                    ← (Google Fonts loaded via CDN)
│
├── css/
│   ├── variables.css             ← Design tokens, CSS reset, @import fonts
│   ├── loader.css                ← Preloader, scroll progress, nav
│   ├── hero.css                  ← Hero section + shared .btn styles
│   └── sections.css              ← All content sections + footer + utilities
│
├── js/
│   ├── universe.js               ← Three.js universe background
│   └── animations.js             ← GSAP: preloader, scroll triggers, parallax
│
└── pages/
    ├── index.html                ← Main portfolio page (single-page)
    └── includes/                 ← Reusable HTML fragments
        ├── head.html             ← <head> meta/links template
        ├── loader.html           ← Preloader markup
        ├── nav.html              ← Navigation bar + canvas + progress bar
        └── footer.html           ← Footer + script tags
```

## Running Locally

```bash
# Python (no install needed)
cd sudip-portfolio
python3 -m http.server 3000
# → open http://localhost:3000/pages/index.html

# Node.js (npx, no install needed)
npx serve .
# → open http://localhost:3000/pages/index.html

# VS Code
# Install "Live Server" extension → right-click pages/index.html → Open with Live Server
```

## Adding a New Page

1. Create `pages/your-page.html`
2. Copy the `<head>` block from `pages/includes/head.html`
3. Paste the loader, nav, and footer include content
4. Add `class="sec-transition"` to each `<section>` for scroll-in animation
5. All CSS/JS paths use `../` prefix (one level up from `pages/`)

## Customisation

| What                  | Where                              |
|-----------------------|------------------------------------|
| Colours / tokens      | `css/variables.css` `:root` block  |
| Universe star count   | `js/universe.js` `L1N / L2N / L3N`|
| Scroll zoom speed     | `js/universe.js` `sp * 80`        |
| Animation timing      | `js/animations.js` `duration` vals |
| Section order         | `pages/index.html` section order   |


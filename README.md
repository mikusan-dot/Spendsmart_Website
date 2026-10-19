# SpendSmart Website

Static website for the SpendSmart expense tracking app, hosted on GitHub Pages.

## Structure

```
├── index.html          # Main landing page
├── privacy.html        # Privacy policy
├── public/
│   ├── favicon.svg     # App icon
│   └── favicon.ico     # Fallback icon
├── src/
│   └── styles.css      # All styles
└── .github/workflows/
    └── deploy.yml      # GitHub Pages deployment
```

## Features

- Responsive design with dark mode support
- Privacy policy page (required for Play Store)
- Security & audit information
- Download link to Play Store
- GitHub Pages ready

## Deployment

1. Push to `main` branch
2. Enable GitHub Pages in repository settings:
   - Source: "GitHub Actions"
3. The workflow will auto-deploy on every push to main

## Local Development

Open `index.html` directly in a browser, or serve with any static server:

```bash
npx serve .
# or
python -m http.server 8000
```

## Customization

- Update Play Store URL in `index.html` and `privacy.html`
- Contact email is `spendsmart.app@gmail.com` (footer + privacy page). Create this Gmail account and monitor it — the privacy policy promises email-based deletion requests.
- Modify colors in `src/styles.css` (`:root` variables)

## Requirements Met

- ✅ Privacy policy hosted at public URL (required for Play Store)
- ✅ Footer links fixed (GitHub, Privacy, Contact)
- ✅ Security audit referenced
- ✅ Responsive, accessible, fast
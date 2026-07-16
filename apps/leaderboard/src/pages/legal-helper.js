// Shared legal page shell helper
export const legal = (title, updated, body, pagePath, desc) => `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} · YourRank</title>
<meta name="description" content="${desc || title}" />
<link rel="canonical" href="https://yourrank.site/${pagePath}" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<header class="topbar"><a class="brand" href="/">Your<b>Rank</b></a>
<div class="topbar-right"><a href="/login" class="btn btn--sm btn--ghost">Sign in</a></div></header>
<main class="legal" id="main-content"><h1>${title}</h1><p class="legal-updated">Last updated: ${updated}</p>
${body}
<p class="legal-foot"><a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/responsible">Responsible play</a> · <a href="/">Home</a></p>
</main></body></html>`;

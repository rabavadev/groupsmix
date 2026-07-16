// index page
export const landingPage = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>YourRank — hosted leaderboards for casino streamers</title>
<meta name="description" content="A hosted leaderboard page for your Stake/Kick community. Edit prizes, code and players from a dashboard. Your page updates instantly." />
<link rel="canonical" href="https://yourrank.site/" />
<meta property="og:title" content="YourRank - Hosted Leaderboards for Streamers">
<meta property="og:description" content="Create your own branded leaderboard page. Track referrals, manage promo codes, and grow your audience.">
<meta property="og:url" content="https://yourrank.site/">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="YourRank - Hosted Leaderboards for Streamers" />
<meta name="twitter:description" content="Create your own branded leaderboard page. Track referrals, manage promo codes, and grow your audience." />
<meta property="og:image" content="https://yourrank.site/og.png" />
<meta name="twitter:image" content="https://yourrank.site/og.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/landing.css" />
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"YourRank","url":"https://yourrank.site","description":"Hosted leaderboard pages for casino streamers","contactPoint":{"@type":"ContactPoint","contactType":"customer service"}}</script>
</head><body>
<noscript><div class="noscript-card">
<h1>YourRank</h1>
<p>Hosted leaderboards for casino streamers. JavaScript is required for the full experience.</p>
<a href="/signup">Create your page</a>
</div></noscript>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<header><div class="wrap">
<nav class="top"><div class="brand">Your<b>Rank</b></div>
<button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
<div class="links"><a href="#how">How it works</a><a href="#postbacks">Postbacks</a><a href="#pricing">Pricing</a><a href="/login">Sign in</a><a href="/signup" class="btn btn--accent">Get started</a></div></nav>
</div></header>
<main id="main-content">
<section class="hero"><div>
<p class="label mb-18">Leaderboards for casino streamers</p>
<h1>Run your leaderboard without touching code.</h1>
<p class="lead">Your prize pool, referral code and ranked players, on a page you edit from a dashboard. Change a number, hit save, your page updates. That's it.</p>
<div class="cta"><a href="/signup" class="btn btn--accent">Create your page</a><a href="/demo" class="btn">Try a demo</a></div>
<p class="fine">Free to start. Your own URL from day one.</p></div>
<div class="spec"><div class="spec-h"><span>your-page.config</span><span class="dot">● live</span></div>
<div class="spec-row"><span>Public URL</span><span>yourrank.site/you</span></div>
<div class="spec-row"><span>Prize pool</span><span>editable</span></div>
<div class="spec-row"><span>Countdown</span><span>auto</span></div>
<div class="spec-row"><span>Standings</span><span>sorted by wager</span></div>
<div class="spec-row"><span>Updates</span><span>instant</span></div></div></section>
<section id="how"><div class="wrap"><h2 class="sec">How it works</h2><p class="sec-sub">Three steps. No build tools, no redeploys, nothing to host yourself.</p>
<div class="steps">
<div class="step"><div class="n">01</div><div><h3>Create your account</h3><p>Pick a handle. That becomes your page URL. Takes about a minute.</p></div></div>
<div class="step"><div class="n">02</div><div><h3>Fill in your details</h3><p>Prize pool, referral code, countdown date, and your ranked players. All from one dashboard.</p></div></div>
<div class="step"><div class="n">03</div><div><h3>Share your link</h3><p>Your page is live. Update the numbers whenever you want and they change instantly.</p></div></div>
</div>
<div class="steps mt-24">
<div class="step"><div class="n">✦</div><div><h3>Built-in analytics</h3><p>Track views, clicks, and referrers from your dashboard. See what's working and where your traffic comes from.</p></div></div>
</div></div></section>
<section id="postbacks"><div class="wrap"><h2 class="sec">Track real conversions</h2><p class="sec-sub">When a casino confirms a player deposited, YourRank receives the postback and updates the leaderboard automatically. No manual updates. No guessing.</p>
<div class="steps">
<div class="step"><div class="n">⟲</div><div><h3>Automatic updates</h3><p>Postbacks from the casino push real deposit data straight into your leaderboard. Your standings stay accurate without you lifting a finger.</p></div></div>
<div class="step"><div class="n">🔌</div><div><h3>Works with any postback-enabled casino</h3><p>Stake, Rollbit, BC.Game, and any other casino that supports postback URLs. Just plug in your YourRank postback URL and the data flows in.</p></div></div>
<div class="step"><div class="n">⚡</div><div><h3>No spreadsheets, no copy-paste</h3><p>Forget manually updating player wagers. The postback system does it in real time — confirmed deposits, verified conversions, zero human error.</p></div></div>
</div></div></section>
<section id="example"><div class="wrap"><h2 class="sec">A real page</h2><p class="sec-sub">This is a live leaderboard running on YourRank. Yours works the same way.</p>
<div class="example"><div class="bar"><span>yourrank.site/demo</span><span>live</span></div>
<iframe src="/demo" loading="lazy" title="Example leaderboard"></iframe></div></div></section>
<section id="pricing"><div class="wrap"><h2 class="sec">Pricing</h2><p class="sec-sub">Start free. Upgrade when your board is pulling weight. Try Pro free for 7 days — paid plans billed in crypto.</p>
<div class="pricing-grid">
<div class="price-card"><div class="price-head"><h3>Free</h3><div class="price-amount">$0</div><div class="price-period">forever</div></div><ul class="price-features"><li>1 leaderboard</li><li>Up to 10 players</li><li>YourRank badge on your page</li><li>Basic analytics (7 days)</li><li>Live countdown &amp; auto-sort</li></ul><a href="/signup" class="btn btn--sm price-cta">Start free</a></div>
<div class="price-card"><div class="price-head"><h3>Starter</h3><div class="price-amount">$12<span>/30 days</span></div></div><ul class="price-features"><li>1 leaderboard</li><li>Up to 25 players</li><li>No YourRank badge</li><li>Full analytics (30 days)</li><li>CSV import</li></ul><a href="/signup" class="btn btn--sm price-cta">Start</a></div>
<div class="price-card price-card--popular"><div class="price-badge">Most Popular</div><div class="price-head"><h3>Pro</h3><div class="price-amount">$29<span>/30 days</span></div></div><ul class="price-features"><li>Up to 3 leaderboards</li><li>Up to 9,999 players</li><li>No YourRank badge</li><li>Custom domain</li><li>OBS overlay widget</li><li>Discord webhooks</li><li>Telegram notifications</li><li>Signed score API</li><li>Priority support</li></ul><a href="/signup" class="btn btn--sm btn--accent price-cta">Go Pro</a></div>
<div class="price-card"><div class="price-head"><h3>Agency</h3><div class="price-amount">$79<span>/30 days</span></div></div><ul class="price-features"><li>Up to 99 leaderboards</li><li>Up to 9,999 players per board</li><li>White-label branding</li><li>Everything in Pro</li><li>Dedicated support</li></ul><a href="/contact" class="btn btn--sm price-cta">Contact us</a></div>
<div class="price-card price-card--lifetime"><div class="price-badge price-badge--lifetime">Best Value</div><div class="price-head"><h3>Lifetime Pro</h3><div class="price-amount">$149<span class="price-amount-sub"> one-time</span></div></div><ul class="price-features"><li>All Pro features</li><li>Pay once, use forever</li><li>No monthly bills</li><li>Up to 3 leaderboards</li><li>Up to 9,999 players</li><li>Custom domain &amp; OBS widget</li><li>Priority support</li></ul><a href="/signup" class="btn btn--accent btn--sm price-cta">Get Lifetime Pro</a></div>
</div>
<p class="sec-sub" style="margin-top:20px"><a href="/pricing">Compare every plan &amp; feature →</a></p></div></section>
<section id="start"><div class="wrap"><h2 class="sec">Ready to start?</h2><p class="sec-sub">Create your free page in under a minute. No credit card needed.</p>
<div class="cta cta-wrap"><a href="/signup" class="btn btn--accent btn--cta-lg">Create your free page</a></div></div></section>
</main>
<footer><div class="wrap footer-wrap">
<span>© <span id="yr"></span> YourRank</span>
<span><a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/refund">Refunds</a> · <a href="/cookies">Cookies</a> · <a href="/responsible">Responsible play</a></span>
<span>18+ · Gambling can be addictive. Play responsibly.</span></div></footer>
<script src="/assets/landing.js?v=2"></script>
</body></html>`;

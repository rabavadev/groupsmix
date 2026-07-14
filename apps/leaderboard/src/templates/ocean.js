export const OCEAN_CSS = `
:root{
  --bg:#020a12;
  --violet-1:#073c52;
  --violet-2:#041b2b;
  --panel:#071827;
  --panel-2:#0a2133;
  --line:rgba(81,219,255,.14);
  --line-2:rgba(81,219,255,.30);
  --ink:#effcff;
  --ink-soft:#a7cad5;
  --ink-mute:#6f96a3;
  --cy:#51dbff;
  --bl:#4776ff;
  --grad-name:linear-gradient(100deg,#baf5ff 0%,#51dbff 48%,#4776ff 100%);
  --grad-cta:linear-gradient(100deg,#24bfe8,#315ee8);
  --gold:#ffd166;
  --radius:18px;
  --radius-sm:11px;
}
body{font-family:"Sora",system-ui,sans-serif}
.field{background:
  radial-gradient(1000px 620px at 50% -15%,rgba(81,219,255,.21),transparent 63%),
  radial-gradient(760px 500px at 95% 20%,rgba(71,118,255,.17),transparent 58%),
  linear-gradient(180deg,var(--violet-2),var(--bg))}
.watermarks{opacity:.025}
.hero-kicker,.eyebrow,.pcol-label{text-transform:uppercase;letter-spacing:.18em}
.hero-name{letter-spacing:-.04em}
.btn--grad{color:#fff}
.panel,.table,.t3,.timer-grid{box-shadow:0 24px 70px rgba(0,0,0,.24),inset 0 1px rgba(255,255,255,.04)}
.panel{background:linear-gradient(145deg,rgba(10,33,51,.96),rgba(7,24,39,.96))}
.panel-badge{color:#03131d}
.t-head{background:linear-gradient(90deg,rgba(81,219,255,.07),rgba(71,118,255,.08))}
.t3--1{border-color:rgba(81,219,255,.44)}
`;

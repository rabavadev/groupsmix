export const SPONSOR_CSS = `
:root{
  --bg:#07090d;
  --violet-1:#171d27;
  --violet-2:#0b0e14;
  --panel:#10141b;
  --panel-2:#161c25;
  --line:rgba(255,255,255,.09);
  --line-2:rgba(255,255,255,.18);
  --ink:#f6f7f9;
  --ink-soft:#b6bdc8;
  --ink-mute:#737c8b;
  --cy:#ff4d4d;
  --bl:#ff9f43;
  --grad-name:linear-gradient(100deg,#ffffff 0%,#ff4d4d 58%,#ff9f43 100%);
  --grad-cta:linear-gradient(100deg,#e83e3e,#f58b32);
  --gold:#ffc857;
  --radius:12px;
  --radius-sm:8px;
}
body{font-family:"Sora",system-ui,sans-serif}
.field{background:
  radial-gradient(900px 540px at 75% -8%,rgba(255,77,77,.16),transparent 62%),
  linear-gradient(135deg,transparent 0 70%,rgba(255,255,255,.018) 70% 71%,transparent 71%),
  linear-gradient(180deg,var(--violet-2),var(--bg))}
.nav{border-bottom:1px solid var(--line)}
.hero-kicker,.eyebrow,.pcol-label{text-transform:uppercase;letter-spacing:.19em}
.hero-name{letter-spacing:-.04em}
.btn--grad{color:#fff}
.panel,.table,.t3,.timer-grid{box-shadow:0 22px 60px rgba(0,0,0,.28)}
.panel{border-top:3px solid var(--cy)}
.panel-badge{border-radius:4px;color:#fff}
.t-head{border-left:4px solid var(--cy)}
.t3--1{border-top:3px solid var(--gold)}
`;

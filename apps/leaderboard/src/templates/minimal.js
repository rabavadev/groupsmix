export const MINIMAL_CSS = `
:root{
  --bg:#f4f3ef;
  --violet-1:#ffffff;
  --violet-2:#f4f3ef;
  --panel:#ffffff;
  --panel-2:#ebe9e2;
  --line:rgba(19,23,29,.10);
  --line-2:rgba(19,23,29,.20);
  --ink:#15171a;
  --ink-soft:#535860;
  --ink-mute:#7b8088;
  --cy:#0066ff;
  --bl:#00a884;
  --grad-name:linear-gradient(100deg,#15171a 0%,#0066ff 100%);
  --grad-cta:linear-gradient(100deg,#15171a,#0066ff);
  --gold:#b77900;
  --radius:4px;
  --radius-sm:3px;
}
body{font-family:"Space Grotesk","Sora",system-ui,sans-serif}
.field{background:linear-gradient(180deg,#fff 0%,var(--bg) 48%)}
.watermarks{display:none}
.nav{border-bottom:1px solid var(--line)}
.hero{padding-top:5.5rem}
.hero-kicker,.eyebrow,.pcol-label{font-family:"JetBrains Mono",monospace;text-transform:uppercase;letter-spacing:.16em}
.hero-name{letter-spacing:-.055em}
.btn{border-radius:2px;box-shadow:none}
.btn--grad{color:#fff}
.btn--ghost{background:transparent}
.panel,.table,.t3,.timer-grid,.rules{box-shadow:0 1px 0 rgba(19,23,29,.04)}
.panel-badge{color:#fff;border-radius:2px}
.t-head{background:#f7f6f2}
.t-row:hover{background:#f8f7f3}
.rk-badge{color:#fff}
`;

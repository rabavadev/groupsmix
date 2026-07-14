export const ROYALE_CSS = `
:root{
  --bg:#10050b;
  --violet-1:#3b0b28;
  --violet-2:#1c0714;
  --panel:#210d19;
  --panel-2:#2d1222;
  --line:rgba(255,204,124,.14);
  --line-2:rgba(255,204,124,.30);
  --ink:#fff7ed;
  --ink-soft:#d7bfc8;
  --ink-mute:#9d7d89;
  --cy:#ffcc7c;
  --bl:#ff6a9f;
  --grad-name:linear-gradient(100deg,#fff4cf 0%,#ffcc7c 48%,#ff6a9f 100%);
  --grad-cta:linear-gradient(100deg,#d89a42,#c83f72);
  --gold:#ffd481;
  --radius:22px;
  --radius-sm:14px;
}
body{font-family:"Sora",system-ui,sans-serif}
.field{background:
  radial-gradient(900px 600px at 50% -12%,rgba(171,27,101,.32),transparent 64%),
  radial-gradient(700px 420px at 12% 25%,rgba(255,204,124,.08),transparent 58%),
  linear-gradient(180deg,var(--violet-2),var(--bg))}
.hero-kicker,.eyebrow,.pcol-label{letter-spacing:.2em;text-transform:uppercase}
.hero-name{font-family:Georgia,"Times New Roman",serif;font-weight:700;letter-spacing:-.035em}
.btn--grad{color:#240b14}
.panel,.table,.t3,.timer-grid{box-shadow:0 28px 80px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.035)}
.panel-badge{color:#240b14}
.code-box{background:rgba(255,204,124,.06)}
.t-head{background:rgba(255,204,124,.045)}
.t3--1{box-shadow:0 0 48px -18px var(--gold),inset 0 1px rgba(255,255,255,.07)}
`;

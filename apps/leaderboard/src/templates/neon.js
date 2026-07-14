export const NEON_CSS = `
:root{
  --bg:#02030a;
  --violet-1:#051c21;
  --violet-2:#050513;
  --panel:#080b18;
  --panel-2:#0c1124;
  --line:rgba(0,255,209,.16);
  --line-2:rgba(255,44,208,.32);
  --ink:#f4ffff;
  --ink-soft:#a9c9d0;
  --ink-mute:#71858e;
  --cy:#00ffd1;
  --bl:#ff2cd0;
  --grad-name:linear-gradient(100deg,#00ffd1 0%,#54a9ff 48%,#ff2cd0 100%);
  --grad-cta:linear-gradient(100deg,#00d9b4,#d91db4);
  --gold:#ffe66d;
  --radius:8px;
  --radius-sm:6px;
}
body{font-family:"Space Grotesk","Sora",system-ui,sans-serif}
.field{background:
  linear-gradient(rgba(0,255,209,.035) 1px,transparent 1px),
  linear-gradient(90deg,rgba(255,44,208,.03) 1px,transparent 1px),
  radial-gradient(900px 520px at 50% -10%,rgba(0,255,209,.14),transparent 62%),
  linear-gradient(180deg,#070417,var(--bg));background-size:54px 54px,54px 54px,auto,auto}
.hero-kicker,.eyebrow,.pcol-label{text-transform:uppercase;letter-spacing:.22em}
.hero-name{text-transform:uppercase;letter-spacing:.01em;text-shadow:0 0 42px rgba(0,255,209,.18)}
.btn,.panel,.board,.table,.t3{box-shadow:0 0 0 1px rgba(0,255,209,.05),0 0 30px rgba(255,44,208,.05)}
.btn--grad{color:#02110e}
.timer-grid,.code-box{box-shadow:inset 0 0 24px rgba(0,255,209,.06)}
.t-head{background:linear-gradient(90deg,rgba(0,255,209,.07),rgba(255,44,208,.07))}
`;

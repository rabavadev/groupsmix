import { escHtml } from "./utils.js";

const pageLinks = [
  { key: "overview", label: "Overview", href: "/bot/dashboard", ic: "\u25F1", sub: "Your bot at a glance — last 14 days" },
  { key: "bots", label: "Bots", href: "/bot/bots", ic: "\u{1F916}", sub: "Connect and customize your Telegram bots" },
  { key: "offers", label: "Offers", href: "/bot/offers", ic: "\u{1F381}", sub: "Your casino links \u2014 clicks are tracked automatically" },
  { key: "commands", label: "Commands", href: "/bot/commands", ic: "\u2318", sub: "Replies your bot sends when viewers type /something" },
  { key: "broadcasts", label: "Broadcasts", href: "/bot/broadcasts", ic: "\u{1F4E3}", sub: "Send a message to everyone who follows your bot" },
  { key: "settings", label: "Settings", href: "/bot/settings", ic: "\u2699", sub: "Deposit tracking and your plan" },
];

export function sideNav(active: string, user: { display_name: string; plan: string }): string {
  const links = pageLinks.map(p =>
    `<a href="${escHtml(p.href)}" class="${p.key === active ? 'active' : ''}"${p.key === active ? ' aria-current="page"' : ''}>` +
    `<span class="ic" aria-hidden="true">${p.ic}</span> ${escHtml(p.label)}</a>`
  ).join("");
  const plan = escHtml((user.plan || "free").replace(/^./, c => c.toUpperCase()));
  return `<aside class="side" id="side" aria-label="Bot dashboard navigation">
    <nav class="snav">${links}</nav>
    <div class="sfoot">Signed in as<br><span class="nm">${escHtml(user.display_name || 'Streamer')}</span> · ${plan}
      <button class="ghost" data-action="logout" type="button">Log out</button></div>
  </aside>`;
}

export function pageHead(active: string): string {
  const p = pageLinks.find(l => l.key === active) || pageLinks[0];
  return `<div class="pagehead"><div class="style-4">
    <button class="menu-btn" id="menuBtn" type="button" aria-label="Open menu">\u2630</button>
    <div><h1>${escHtml(p.label)}</h1><p>${escHtml(p.sub)}</p></div></div></div>`;
}

// commands dashboard page panels
export function commandsPanel(): string {
  return `
  <div class="panel" data-page="commands" id="commandsEmptyHint">
    <h2>Commands</h2>
    <p class="muted">Connect a bot first — do that in <a href="/bot/bots">Bots</a>.</p>
  </div>

  <!-- Customization (bots, commands) -->
  <div class="panel" data-page="bots commands" id="customizePanel">
    <h2>Customize <select class="style-14" id="botSelect" aria-label="Select bot"><option>Loading…</option></select></h2>
    <div id="custDisabledNote" class="muted style-15 hidden">This bot is disconnected — reconnect it to customize.</div>
    <p class="muted style-16">Personalize what the selected bot says to viewers. Changes apply instantly — no redeploy needed.</p>

    <label for="welcomeMsg" class="muted style-17">Welcome message — the reply to <code>/start</code></label>
    <textarea id="welcomeMsg" rows="2" placeholder="Leave blank to use the default greeting"></textarea>
    <button data-action="saveWelcome" type="button">Save welcome message</button>

    <h3 class="style-18">Custom commands</h3>
    <p class="muted style-19">Add slash-commands your viewers can send (e.g. <code>/vip</code>) and the reply they'll get. Built-ins like <code>/start</code>, <code>/code</code>, <code>/subscribe</code> are reserved.</p>
    <div class="row">
      <label class="sr-only" for="cmdName">Command</label>
      <input id="cmdName" placeholder="Command (e.g. vip)">
      <label class="sr-only" for="cmdResp">Reply</label>
      <input id="cmdResp" placeholder="Reply text viewers receive">
    </div>
    <button data-action="addCommand" type="button">Add command</button>
    <table class="style-20"><thead><tr><th>Command</th><th>Reply</th><th>Status</th><th><span class="sr-only">Actions</span></th></tr></thead>
    <tbody id="cmdList"><tr><td colspan="4" class="muted">Loading…</td></tr></tbody></table>
  </div>`;
}

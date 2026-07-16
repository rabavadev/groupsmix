// bots dashboard page panels
export function botsPanel(): string {
  return `
  <div class="panel" data-page="bots"><h2>Your bots</h2>
    <div id="botList" class="muted">Loading…</div>
    <div class="style-10" id="connectForm">
      <label class="sr-only" for="botToken">Bot Token</label>
      <div class="style-11">
        <input class="style-12" id="botToken" type="password" autocomplete="off" placeholder="Paste bot token from @BotFather (123456:ABC-...)">
        <button class="ghost" data-action="toggleToken" type="button" aria-label="Show token">Show</button>
      </div>
      <label class="sr-only" for="botWelcome">Welcome Message</label>
      <input id="botWelcome" placeholder="Welcome message (optional)">
      <button data-action="connectBot" type="button">Connect bot</button>
    </div>
  </div>

  <!-- Test message (bots) -->
  <div class="panel" data-page="bots" id="testMsgPanel" hidden>
    <h2>Send a test message</h2>
    <p class="muted style-13">Send a one-off message from <b id="tmBotName">your bot</b> to confirm it works. Get your chat ID by sending <code>/start</code> to <a href="https://t.me/userinfobot" target="_blank" rel="noopener">@userinfobot</a>.</p>
    <div class="row">
      <label class="sr-only" for="tmChatId">Chat ID</label>
      <input id="tmChatId" inputmode="numeric" placeholder="Your Telegram chat ID (e.g. 123456789)">
      <label class="sr-only" for="tmText">Message</label>
      <input id="tmText" placeholder="Message to send">
    </div>
    <button data-action="sendTestMessage" type="button">Send test message</button>
    <button class="ghost" data-action="cancelTestMessage" type="button">Cancel</button>
  </div>`;
}

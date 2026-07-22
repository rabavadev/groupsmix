// Shared demo leaderboard data — used by /demo page, /go/demo redirect,
// /demo overlay, and /api/public/demo* API endpoints.
export function demoLeaderboardData() {
  return {
    brand: {
      name: "StakeDrop",
      casino: "Stake",
      code: "DEMO2025",
      ctaUrl: "https://stake.com/?c=DEMO2025",
      prizePool: "$5,000",
      period: "Monthly",
      tagline: "Casino streamer & Stake partner",
      resetNote: "",
      blurb: "Welcome to the official StakeDrop leaderboard. Use code DEMO2025 to join and climb the ranks. Top wagerers win big every month.",
    },
    branding: { hasLogo: false },
    players: [
      { name: "Crypto*****99", wagered: 287400, prize: 1500 },
      { name: "StakeWhale", wagered: 214800, prize: 1000 },
      { name: "DiceKing", wagered: 189200, prize: 750 },
      { name: "*****blue", wagered: 156000, prize: 500 },
      { name: "HighRoller", wagered: 134500, prize: 250 },
      { name: "JackpotJen", wagered: 112000, prize: 0 },
      { name: "SlotNinja", wagered: 98700, prize: 0 },
      { name: "*****ace", wagered: 87400, prize: 0 },
      { name: "BetMaster", wagered: 76200, prize: 0 },
      { name: "LuckyStar", wagered: 65100, prize: 0 },
    ],
    endsAt: new Date(Date.now() + 12 * 86400000).toISOString(),
    rules: ["Wagers on Stake count towards your ranking.", "Minimum wager: $1,000.", "Leaderboard resets at the end of each month.", "Prizes credited within 48h of reset."],
    whyStats: [
      { big: "Licensed", label: "Provably Fair", sub: "Verified gaming platform" },
      { big: "Instant", label: "Deposits & Withdrawals", sub: "No waiting around" },
      { big: "24/7", label: "Live Support", sub: "Always online" },
      { big: "Exclusive", label: "VIP Rewards", sub: "Top-tier perks" },
    ],
    socials: [
      { platform: "kick", url: "https://kick.com/stakedrop", label: "Follow on Kick" },
      { platform: "twitter", url: "https://x.com/stakedrop", label: "Follow on X" },
      { platform: "discord", url: "https://discord.gg/stakedrop", label: "Join Discord" },
    ],
    archives: [],
  };
}

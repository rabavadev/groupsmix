// Admin 2FA verification/enrollment page — extracted from inline <script> for CSP compliance.
function getCsrf() { const m = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/); return m ? m[1] : ""; }
function $(id) { return document.getElementById(id); }
function show(el) { el.hidden = false; }
function hide(el) { el.hidden = true; }

function setErr(id, msg) { $(id).textContent = msg || ""; }
function disable(id, v) { $(id).disabled = !!v; }

async function api(path, opts = {}) {
  const merged = { ...opts, credentials: "include" };
  if (opts.body && !merged.headers?.["content-type"]) {
    merged.headers = { ...(merged.headers || {}), "content-type": "application/json" };
  }
  if (["POST", "PUT", "PATCH", "DELETE"].includes((merged.method || "GET").toUpperCase())) {
    merged.headers = { ...(merged.headers || {}), "x-csrf-token": getCsrf() };
  }
  const res = await fetch(path, merged);
  const d = await res.json().catch(() => ({}));
  if (res.status === 401) { location.href = "/login"; throw new Error("auth"); }
  return { res, data: d };
}

function renderCodes(codes) {
  if (!codes?.length) return;
  $("tfaRecoveryList").innerHTML = codes.map((c) => `<li><code>${c}</code></li>`).join("");
  show($("tfaSuccess"));
  hide($("tfaVerify"));
  hide($("tfaSetup"));
  hide($("tfaRecovery"));
}

async function startSetup() {
  setErr("tfaSetupErr", "");
  disable("tfaSetupSubmit", true);
  const { res, data } = await api("/api/admin/2fa/enable", { method: "POST" });
  if (!res.ok || !data.ok || !data.uri) {
    setErr("tfaSetupErr", data.error || "Failed to start 2FA setup.");
    disable("tfaSetupSubmit", false);
    return;
  }
  $("tfaQr").src = QRCode.toDataURL(data.uri, 200);
  $("tfaSecret").textContent = data.secret || "";
  show($("tfaSetup"));
  hide($("tfaVerify"));
  hide($("tfaRecovery"));
  disable("tfaSetupSubmit", false);
}

async function submitSetup() {
  const code = $("tfaSetupCode").value.trim();
  if (!/^\d{6}$/.test(code)) { setErr("tfaSetupErr", "Enter a 6-digit code."); return; }
  setErr("tfaSetupErr", "");
  disable("tfaSetupSubmit", true);
  const { res, data } = await api("/api/admin/2fa/verify", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  if (res.ok && data.ok && data.verified) {
    if (data.recoveryCodes?.length) renderCodes(data.recoveryCodes);
    else location.href = "/admin";
    return;
  }
  setErr("tfaSetupErr", data.error || "Verification failed. Try the code from your authenticator.");
  disable("tfaSetupSubmit", false);
}

async function submitVerify() {
  const code = $("tfaCode").value.trim();
  if (!/^\d{6}$/.test(code)) { setErr("tfaErr", "Enter a 6-digit code."); return; }
  setErr("tfaErr", "");
  disable("tfaSubmit", true);
  const { res, data } = await api("/api/admin/2fa/verify", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  if (res.ok && data.ok && data.verified) {
    location.href = "/admin";
    return;
  }
  setErr("tfaErr", data.error || "Invalid code.");
  disable("tfaSubmit", false);
}

async function submitRecovery() {
  const raw = $("tfaRecoveryCode").value.trim();
  const code = raw.replace(/[^0-9a-fA-F]/g, "").toLowerCase();
  if (code.length !== 16) { setErr("tfaRecoveryErr", "Enter a 16-character recovery code."); return; }
  setErr("tfaRecoveryErr", "");
  disable("tfaRecoverySubmit", true);
  const { res, data } = await api("/api/admin/2fa/recovery", {
    method: "POST",
    body: JSON.stringify({ code: raw }),
  });
  if (res.ok && data.ok && data.verified) {
    location.href = "/admin";
    return;
  }
  setErr("tfaRecoveryErr", data.error || "Invalid or already used recovery code.");
  disable("tfaRecoverySubmit", false);
}

function showRecovery() {
  setErr("tfaRecoveryErr", "");
  $("tfaRecoveryCode").value = "";
  show($("tfaRecovery"));
  hide($("tfaVerify"));
  hide($("tfaSetup"));
  hide($("tfaSuccess"));
}

function showVerify() {
  setErr("tfaErr", "");
  $("tfaCode").value = "";
  show($("tfaVerify"));
  hide($("tfaSetup"));
  hide($("tfaRecovery"));
  hide($("tfaSuccess"));
}

(async function () {
  const { res, data } = await api("/api/admin/2fa/status");
  if (!res.ok || !data.ok) { location.href = "/login"; return; }

  if (data.locked) {
    setErr("tfaErr", "2FA is temporarily locked due to too many failed attempts. Try again later.");
    $("tfaCode").disabled = true;
    $("tfaSubmit").disabled = true;
    return;
  }

  if (!data.enabled) {
    await startSetup();
  } else if (!data.verified) {
    showVerify();
  } else {
    location.href = "/admin";
    return;
  }
})();

$("tfaSubmit").onclick = submitVerify;
$("tfaSetupSubmit").onclick = submitSetup;
$("tfaRecoverySubmit").onclick = submitRecovery;
$("tfaUseRecovery").onclick = (e) => { e.preventDefault(); showRecovery(); };
$("tfaBackToCode").onclick = (e) => { e.preventDefault(); showVerify(); };
$("tfaDone").onclick = () => { location.href = "/admin"; };
$("logout").onclick = async (e) => {
  e.preventDefault();
  await fetch("/api/auth/logout", { method: "POST", credentials: "include", headers: { "x-csrf-token": getCsrf() } });
  location.href = "/login";
};

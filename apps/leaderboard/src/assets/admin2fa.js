// Admin 2FA verification page — extracted from inline <script> for CSP compliance.
function getCsrf(){const m=document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);return m?m[1]:"";}
(async function(){
// Check 2FA status
const res=await fetch("/api/admin/2fa/status");
const data=await res.json();
if(!data.ok){location.href="/login";return;}

if(!data.enabled){
// Show setup flow
document.getElementById("tfaVerify").hidden=true;
document.getElementById("tfaSetup").hidden=false;
document.getElementById("tfaSetupSubmit").onclick=async()=>{
const code=document.getElementById("tfaSetupCode").value.trim();
if(!/^\d{6}$/.test(code)){document.getElementById("tfaSetupErr").textContent="Enter a 6-digit code.";return;}
document.getElementById("tfaSetupErr").textContent="";
document.getElementById("tfaSetupSubmit").disabled=true;
// Enable 2FA
const enRes=await fetch("/api/admin/2fa/enable",{method:"POST",headers:{"x-csrf-token":getCsrf()}});
const enData=await enRes.json();
if(!enData.ok){document.getElementById("tfaSetupErr").textContent=enData.error||"Failed to enable 2FA.";document.getElementById("tfaSetupSubmit").disabled=false;return;}
// Show QR code
var qrUrl="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data="+encodeURIComponent(enData.uri);
document.getElementById("tfaQr").src=qrUrl;
document.getElementById("tfaSecret").textContent=enData.secret;
// Verify the code
const vRes=await fetch("/api/admin/2fa/verify",{method:"POST",headers:{"content-type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify({code})});
const vData=await vRes.json();
if(vData.ok&&vData.verified){location.href="/admin";}else{document.getElementById("tfaSetupErr").textContent=vData.error||"Verification failed. Try the code from your authenticator.";document.getElementById("tfaSetupSubmit").disabled=false;}
};
}else if(!data.verified){
// Show verify flow
document.getElementById("tfaSubmit").onclick=async()=>{
const code=document.getElementById("tfaCode").value.trim();
if(!/^\d{6}$/.test(code)){document.getElementById("tfaErr").textContent="Enter a 6-digit code.";return;}
document.getElementById("tfaErr").textContent="";
document.getElementById("tfaSubmit").disabled=true;
const vRes=await fetch("/api/admin/2fa/verify",{method:"POST",headers:{"content-type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify({code})});
const vData=await vRes.json();
if(vData.ok&&vData.verified){location.href="/admin";}else{document.getElementById("tfaErr").textContent=vData.error||"Invalid code.";document.getElementById("tfaSubmit").disabled=false;}
};
}
})();
document.getElementById("logout").onclick=async(e)=>{e.preventDefault();await fetch("/api/auth/logout",{method:"POST",headers:{"x-csrf-token":getCsrf()}});location.href="/login";};

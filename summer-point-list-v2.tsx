import { useState, useEffect, useCallback } from "react";

// ─── CHALLENGES ───────────────────────────────────────────────
const CHALLENGES = [
  { id:"c1",  pts:5,  text:"Wear a bikini",                          emoji:"👙" },
  { id:"c2",  pts:5,  text:"Ask for a stranger's snap",              emoji:"📱" },
  { id:"c3",  pts:5,  text:"Get called cute / pretty / sexy",        emoji:"💅" },
  { id:"c4",  pts:5,  text:"Selfie with a stranger",                 emoji:"🤳" },
  { id:"c5",  pts:10, text:"Ask for someone's number",               emoji:"📞" },
  { id:"c6",  pts:10, text:"Sleep outside",                          emoji:"🌙" },
  { id:"c7",  pts:10, text:"Tell someone they're cute",              emoji:"💬" },
  { id:"c8",  pts:20, text:"Set your friend up with someone",        emoji:"💕" },
  { id:"c9",  pts:20, text:"Kiss someone",                           emoji:"💋" },
  { id:"c10", pts:20, text:"Get day drunk",                          emoji:"🍹" },
  { id:"c11", pts:30, text:"Propose to a stranger",                  emoji:"💍" },
  { id:"c12", pts:30, text:"Get a guy's hoodie",                     emoji:"🧥" },
  { id:"c13", pts:30, text:"Truth or dare with a big unknown group", emoji:"🎲" },
  { id:"c14", pts:30, text:"Get your snap / number asked",           emoji:"🔥" },
];

const AVATARS = ["🌸","🦋","🌊","🌺","🍉","🌙","⭐","🦩","🌴","🐚","🍓","🌈"];
const STORAGE_KEY = "summerPointListV2";
const POLL_MS = 4000;

function getScore(completions) {
  return (completions || []).reduce((s, id) => {
    const c = CHALLENGES.find(x => x.id === id);
    return s + (c ? c.pts : 0);
  }, 0);
}

// ─── SHARED STORAGE HELPERS ───────────────────────────────────
async function loadShared() {
  try {
    const res = await window.storage.get(STORAGE_KEY, true);
    if (res?.value) return JSON.parse(res.value);
  } catch (_) {}
  return { players: [], completions: {} };
}
async function saveShared(data) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(data), true); } catch (_) {}
}

// ─── STYLES ──────────────────────────────────────────────────
const S = {
  body: {
    fontFamily:"'Nunito',sans-serif",
    background:"#FFF0E6",
    minHeight:"100vh",
    color:"#3D2C2C",
  },
  header: {
    background:"linear-gradient(135deg,#F4726B 0%,#F9A98C 60%,#F9C784 100%)",
    padding:"28px 20px 56px",
    textAlign:"center",
    position:"relative",
    overflow:"hidden",
  },
  headerWave: {
    position:"absolute",bottom:-2,left:0,right:0,height:48,
    background:"#FFF0E6",
    clipPath:"ellipse(55% 100% at 50% 100%)",
  },
  h1: {
    fontFamily:"'Pacifico',cursive",
    fontSize:"2.2rem",color:"#fff",
    textShadow:"2px 3px 0 rgba(0,0,0,0.1)",
  },
  sub: { color:"rgba(255,255,255,0.9)",fontWeight:700,fontSize:"0.82rem",letterSpacing:2,textTransform:"uppercase",marginTop:4 },
  container: { maxWidth:480,margin:"0 auto",padding:"20px 16px 100px" },

  card: { background:"#fff",borderRadius:20,padding:24,boxShadow:"0 4px 20px rgba(244,114,107,0.13)",marginBottom:16 },

  // login
  loginTitle: { fontFamily:"'Pacifico',cursive",fontSize:"1.5rem",color:"#F4726B",textAlign:"center",marginBottom:6 },
  loginSub: { textAlign:"center",color:"#9B7B7B",fontSize:"0.85rem",marginBottom:22 },
  playersGrid: { display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18 },
  playerBtn: (active) => ({
    background: active ? "linear-gradient(135deg,#F4726B,#F9A98C)" : "#FFF0E6",
    border: `2px solid ${active ? "#F4726B" : "#FFD6CC"}`,
    borderRadius:16,padding:"16px 8px",cursor:"pointer",textAlign:"center",
    transition:"all 0.2s",fontFamily:"'Nunito',sans-serif",
    color: active ? "#fff" : "#3D2C2C",
  }),

  divider: { display:"flex",alignItems:"center",gap:10,margin:"14px 0",color:"#9B7B7B",fontSize:"0.8rem" },
  divLine: { flex:1,height:1,background:"#FFD6CC" },

  label: { display:"block",fontWeight:700,fontSize:"0.8rem",color:"#9B7B7B",marginBottom:6,textTransform:"uppercase",letterSpacing:1 },
  input: { width:"100%",padding:"11px 14px",border:"2px solid #FFD6CC",borderRadius:12,fontFamily:"'Nunito',sans-serif",fontSize:"0.95rem",color:"#3D2C2C",background:"#FFFAF6",outline:"none",boxSizing:"border-box" },

  btnPrimary: { width:"100%",padding:14,border:"none",borderRadius:14,fontFamily:"'Nunito',sans-serif",fontSize:"1rem",fontWeight:800,cursor:"pointer",background:"linear-gradient(135deg,#F4726B,#F9A98C)",color:"#fff",boxShadow:"0 4px 15px rgba(244,114,107,0.35)",transition:"all 0.2s" },

  // welcome bar
  welcomeBar: { display:"flex",alignItems:"center",justifyContent:"space-between",background:"#fff",borderRadius:16,padding:"12px 16px",marginBottom:14,boxShadow:"0 4px 20px rgba(244,114,107,0.1)" },
  scoreBadge: { background:"linear-gradient(135deg,#F4726B,#F9A98C)",color:"#fff",borderRadius:12,padding:"8px 14px",textAlign:"center" },

  // tabs
  tabs: { display:"flex",gap:6,marginBottom:18,background:"#fff",borderRadius:16,padding:6,boxShadow:"0 4px 20px rgba(244,114,107,0.1)" },
  tab: (active) => ({
    flex:1,padding:"9px 4px",border:"none",borderRadius:12,
    background: active ? "linear-gradient(135deg,#F4726B,#F9A98C)" : "transparent",
    color: active ? "#fff" : "#9B7B7B",
    fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:"0.78rem",cursor:"pointer",textAlign:"center",transition:"all 0.2s",
  }),

  // section header
  sectionHeader: { fontFamily:"'Pacifico',cursive",fontSize:"1.05rem",color:"#F4726B",margin:"18px 0 10px",display:"flex",alignItems:"center",gap:8 },
  ptsBadge: { background:"#F4726B",color:"#fff",borderRadius:20,padding:"2px 10px",fontFamily:"'Nunito',sans-serif",fontSize:"0.75rem",fontWeight:800 },

  // challenge item
  challengeItem: (done) => ({
    background: done ? "linear-gradient(135deg,rgba(244,114,107,0.06),rgba(78,205,196,0.06))" : "#fff",
    border: `2px solid ${done ? "#F9A98C" : "transparent"}`,
    borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10,
    boxShadow:"0 2px 12px rgba(244,114,107,0.07)",cursor:"pointer",transition:"all 0.2s",
  }),
  checkCircle: (done) => ({
    width:26,height:26,borderRadius:"50%",
    border: `2.5px solid ${done ? "#F4726B" : "#FFD6CC"}`,
    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
    background: done ? "linear-gradient(135deg,#F4726B,#F9A98C)" : "transparent",
    color:"#fff",fontSize:"0.8rem",transition:"all 0.25s",
  }),

  // scoreboard
  scoreCard: (isMe) => ({
    background:"#fff",borderRadius:14,padding:"12px 16px",marginBottom:10,
    display:"flex",alignItems:"center",gap:12,
    boxShadow:"0 2px 12px rgba(244,114,107,0.08)",
    borderLeft: isMe ? "4px solid #F4726B" : "4px solid transparent",
    cursor:"pointer",
  }),

  // others
  otherCard: { background:"#fff",borderRadius:14,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 12px rgba(244,114,107,0.08)",cursor:"pointer",border:"2px solid transparent",transition:"all 0.2s" },

  logoutBtn: { background:"none",border:"none",color:"#9B7B7B",fontFamily:"'Nunito',sans-serif",fontSize:"0.8rem",fontWeight:700,cursor:"pointer",padding:"4px 8px",marginBottom:14,display:"block" },

  // toast
  toastWrap: { position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",zIndex:999,pointerEvents:"none" },
  toast: (show) => ({
    background:"linear-gradient(135deg,#F4726B,#F9A98C)",color:"#fff",padding:"11px 22px",borderRadius:50,
    fontWeight:800,fontSize:"0.88rem",boxShadow:"0 6px 24px rgba(244,114,107,0.4)",
    transition:"all 0.35s cubic-bezier(0.175,0.885,0.32,1.275)",
    opacity: show ? 1 : 0,transform: show ? "translateY(0)" : "translateY(20px)",
    whiteSpace:"nowrap",
  }),

  syncDot: (syncing) => ({
    width:8,height:8,borderRadius:"50%",
    background: syncing ? "#F9A98C" : "#4ECDC4",
    display:"inline-block",marginRight:6,
    animation: syncing ? "pulse 1s infinite" : "none",
  }),
};

// ─── MAIN APP ────────────────────────────────────────────────
export default function App() {
  const [data, setData]           = useState({ players:[], completions:{} });
  const [me, setMe]               = useState(null); // player object
  const [tab, setTab]             = useState("challenges");
  const [viewPlayer, setViewPlayer] = useState(null);
  const [toast, setToast]         = useState({ msg:"", show:false });
  const [newName, setNewName]     = useState("");
  const [selEmoji, setSelEmoji]   = useState("🌸");
  const [syncing, setSyncing]     = useState(false);
  const [screen, setScreen]       = useState("login"); // login | app

  // ── load + poll ──────────────────────────────────────────
  const refresh = useCallback(async (silent = true) => {
    if (!silent) setSyncing(true);
    const d = await loadShared();
    setData(d);
    if (!silent) setSyncing(false);
  }, []);

  useEffect(() => { refresh(false); }, []);
  useEffect(() => {
    const id = setInterval(() => refresh(true), POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  // ── toast ────────────────────────────────────────────────
  const showToast = (msg) => {
    setToast({ msg, show:true });
    setTimeout(() => setToast(t => ({ ...t, show:false })), 2800);
  };

  // ── login ────────────────────────────────────────────────
  const loginAs = (player) => {
    setMe(player);
    setScreen("app");
    setTab("challenges");
    showToast(`Hey ${player.name}! ${player.emoji} Ready?`);
  };

  const addAndLogin = async () => {
    const name = newName.trim();
    if (!name) { showToast("Vul eerst je naam in 😅"); return; }
    const fresh = await loadShared();
    const existing = fresh.players.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existing) { loginAs(existing); return; }
    const player = { id:"p"+Date.now(), name, emoji:selEmoji };
    fresh.players.push(player);
    fresh.completions[player.id] = [];
    await saveShared(fresh);
    setData(fresh);
    loginAs(player);
  };

  // ── toggle challenge ──────────────────────────────────────
  const toggleChallenge = async (chId) => {
    const fresh = await loadShared();
    const done = [...(fresh.completions[me.id] || [])];
    const idx  = done.indexOf(chId);
    const ch   = CHALLENGES.find(c => c.id === chId);
    if (idx === -1) { done.push(chId); showToast(`+${ch.pts} pts! ${ch.emoji} Yes!`); }
    else            { done.splice(idx, 1); showToast(`${ch.text} uitgevinkt`); }
    fresh.completions[me.id] = done;
    await saveShared(fresh);
    setData(fresh);
  };

  // ── derived ───────────────────────────────────────────────
  const myDone  = me ? (data.completions[me.id] || []) : [];
  const myScore = getScore(myDone);
  const ranked  = [...data.players]
    .map(p => ({ ...p, score: getScore(data.completions[p.id] || []), done:(data.completions[p.id]||[]).length }))
    .sort((a,b) => b.score - a.score);

  const today = new Date().toLocaleDateString("nl-NL",{ weekday:"long",day:"numeric",month:"long" });

  // ─────────────────────────────────────────────────────────
  // RENDER: LOGIN
  // ─────────────────────────────────────────────────────────
  if (screen === "login") return (
    <div style={S.body}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Nunito:wght@400;600;700;800&display=swap');
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      *{box-sizing:border-box}`}</style>

      <div style={S.header}>
        <div style={{fontSize:"1.8rem",marginBottom:8}}>🌊 🦀 🐚</div>
        <h1 style={S.h1}>Summer Point List</h1>
        <div style={S.sub}>Vacation Challenge ✨</div>
        <div style={S.headerWave}/>
      </div>

      <div style={S.container}>
        <div style={S.card}>
          <div style={S.loginTitle}>Wie ben jij? 🌺</div>
          <div style={S.loginSub}>Kies je naam om in te loggen</div>

          {data.players.length > 0 && (
            <div style={S.playersGrid}>
              {data.players.map(p => (
                <button key={p.id} style={S.playerBtn(false)} onClick={() => loginAs(p)}>
                  <div style={{fontSize:"1.8rem",marginBottom:4}}>{p.emoji}</div>
                  <div style={{fontWeight:800,fontSize:"0.88rem"}}>{p.name}</div>
                  <div style={{fontSize:"0.75rem",color:"#F4726B",fontWeight:700}}>{getScore(data.completions[p.id]||[])} pts</div>
                </button>
              ))}
            </div>
          )}

          <div style={S.divider}><div style={S.divLine}/><span>of voeg jezelf toe</span><div style={S.divLine}/></div>

          <div style={{marginBottom:12}}>
            <label style={S.label}>Jouw naam</label>
            <input style={S.input} placeholder="Bijv. Lisa" maxLength={20}
              value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key==="Enter" && addAndLogin()} />
          </div>
          <div style={{marginBottom:20}}>
            <label style={S.label}>Kies een emoji</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
              {AVATARS.map(em => (
                <button key={em} onClick={() => setSelEmoji(em)} style={{
                  fontSize:"1.5rem",background: selEmoji===em ? "#FFD6CC" : "none",
                  border:`2px solid ${selEmoji===em ? "#F4726B" : "transparent"}`,
                  borderRadius:8,padding:4,cursor:"pointer",lineHeight:1,
                }}>{em}</button>
              ))}
            </div>
          </div>
          <button style={S.btnPrimary} onClick={addAndLogin}>Meedoen! 🎉</button>
        </div>
      </div>

      <div style={S.toastWrap}><div style={S.toast(toast.show)}>{toast.msg}</div></div>
    </div>
  );

  // ─────────────────────────────────────────────────────────
  // RENDER: APP
  // ─────────────────────────────────────────────────────────
  return (
    <div style={S.body}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Nunito:wght@400;600;700;800&display=swap');
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      *{box-sizing:border-box}`}</style>

      <div style={S.header}>
        <div style={{fontSize:"1.8rem",marginBottom:8}}>🌊 🦀 🐚</div>
        <h1 style={S.h1}>Summer Point List</h1>
        <div style={S.sub}>Vacation Challenge ✨</div>
        <div style={S.headerWave}/>
      </div>

      <div style={S.container}>
        {/* welcome + logout */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <button style={S.logoutBtn} onClick={() => setScreen("login")}>← Switch</button>
          <div style={{fontSize:"0.75rem",color:"#9B7B7B",fontWeight:600}}>
            <span style={S.syncDot(syncing)}/>
            {syncing ? "Syncing…" : "Live"}
          </div>
        </div>

        {/* welcome bar */}
        <div style={S.welcomeBar}>
          <div>
            <div style={{fontSize:"0.78rem",color:"#9B7B7B",fontWeight:600}}>Hey girl 👋</div>
            <div style={{fontWeight:800,fontSize:"0.95rem"}}>{me.emoji} {me.name}</div>
          </div>
          <div style={S.scoreBadge}>
            <div style={{fontFamily:"'Pacifico',cursive",fontSize:"1.3rem",lineHeight:1}}>{myScore}</div>
            <div style={{fontSize:"0.65rem",fontWeight:700,opacity:0.9,textTransform:"uppercase"}}>punten</div>
          </div>
        </div>

        {/* tabs */}
        <div style={S.tabs}>
          {[["challenges","✅","Opdrachten"],["scoreboard","🏆","Scorebord"],["others","👀","Anderen"]].map(([k,ic,lb]) => (
            <button key={k} style={S.tab(tab===k && viewPlayer===null)} onClick={() => { setTab(k); setViewPlayer(null); }}>
              <div style={{fontSize:"1.1rem"}}>{ic}</div>{lb}
            </button>
          ))}
        </div>

        {/* ── CHALLENGES ── */}
        {tab==="challenges" && (
          <div>
            {[5,10,20,30].map(pts => (
              <div key={pts}>
                <div style={S.sectionHeader}>
                  <span>{pts===5?"🌺":pts===10?"🌊":pts===20?"🔥":"💎"}</span>
                  {pts} punten
                  <span style={S.ptsBadge}>{pts} pts</span>
                </div>
                {CHALLENGES.filter(c => c.pts===pts).map(ch => {
                  const done = myDone.includes(ch.id);
                  return (
                    <div key={ch.id} style={S.challengeItem(done)} onClick={() => toggleChallenge(ch.id)}>
                      <div style={S.checkCircle(done)}>{done ? "✓" : ""}</div>
                      <span style={{fontSize:"1.1rem"}}>{ch.emoji}</span>
                      <div style={{flex:1,fontWeight:700,fontSize:"0.88rem",textDecoration:done?"line-through":"none",color:done?"#9B7B7B":"#3D2C2C"}}>{ch.text}</div>
                      <div style={{fontWeight:800,fontSize:"0.82rem",color:"#5BBCD6"}}>+{ch.pts}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* ── SCOREBOARD ── */}
        {tab==="scoreboard" && viewPlayer===null && (
          <div>
            <div style={{textAlign:"center",color:"#9B7B7B",fontSize:"0.8rem",fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>{today}</div>
            {ranked.map((p,i) => {
              const isMe = me && p.id===me.id;
              const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`;
              return (
                <div key={p.id} style={S.scoreCard(isMe)}>
                  <div style={{width:34,height:34,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:i===0?"linear-gradient(135deg,#FFD700,#FFA500)":i===1?"linear-gradient(135deg,#C0C0C0,#A0A0A0)":i===2?"linear-gradient(135deg,#CD7F32,#B8692A)":"#FFF0E6",color:"#fff",fontWeight:800,fontSize:"0.85rem",flexShrink:0}}>{medal}</div>
                  <div style={{fontSize:"1.4rem"}}>{p.emoji}</div>
                  <div style={{flex:1,fontWeight:800,fontSize:"0.92rem"}}>{p.name}{isMe && <span style={{fontSize:"0.7rem",color:"#F4726B"}}> (jij)</span>}</div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'Pacifico',cursive",fontSize:"1.2rem",color:"#F4726B"}}>{p.score}</div>
                    <div style={{fontSize:"0.65rem",color:"#9B7B7B",fontWeight:600}}>punten</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── OTHERS ── */}
        {tab==="others" && viewPlayer===null && (
          <div>
            {data.players.filter(p => !me || p.id!==me.id).length === 0
              ? <div style={{textAlign:"center",padding:30,color:"#9B7B7B",fontWeight:700}}>Nog niemand anders 👀</div>
              : data.players.filter(p => !me || p.id!==me.id).map(p => {
                const pts = getScore(data.completions[p.id]||[]);
                const cnt = (data.completions[p.id]||[]).length;
                return (
                  <div key={p.id} style={S.otherCard} onClick={() => setViewPlayer(p)}>
                    <div style={{fontSize:"1.8rem"}}>{p.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:800,fontSize:"0.92rem"}}>{p.name}</div>
                      <div style={{fontSize:"0.78rem",color:"#9B7B7B",fontWeight:600}}>{cnt} opdrachten gedaan</div>
                    </div>
                    <div style={{fontFamily:"'Pacifico',cursive",fontSize:"1.15rem",color:"#F4726B"}}>{pts} pts</div>
                    <div style={{color:"#9B7B7B",marginLeft:4,fontSize:"1.1rem"}}>›</div>
                  </div>
                );
              })
            }
          </div>
        )}

        {/* ── VIEW OTHER PLAYER ── */}
        {viewPlayer !== null && (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
              <button onClick={() => setViewPlayer(null)} style={{background:"#FFF0E6",border:"none",borderRadius:10,padding:"8px 12px",cursor:"pointer",color:"#F4726B",fontFamily:"'Nunito',sans-serif",fontWeight:800}}>← Terug</button>
              <div style={{fontFamily:"'Pacifico',cursive",fontSize:"1.15rem"}}>{viewPlayer.emoji} {viewPlayer.name}</div>
            </div>
            {[5,10,20,30].map(pts => {
              const vpDone = data.completions[viewPlayer.id] || [];
              return (
                <div key={pts}>
                  <div style={S.sectionHeader}>
                    <span>{pts===5?"🌺":pts===10?"🌊":pts===20?"🔥":"💎"}</span>
                    {pts} punten
                  </div>
                  {CHALLENGES.filter(c => c.pts===pts).map(ch => {
                    const done = vpDone.includes(ch.id);
                    return (
                      <div key={ch.id} style={{...S.challengeItem(done),cursor:"default"}}>
                        <div style={S.checkCircle(done)}>{done ? "✓" : ""}</div>
                        <span style={{fontSize:"1.1rem"}}>{ch.emoji}</span>
                        <div style={{flex:1,fontWeight:700,fontSize:"0.88rem",textDecoration:done?"line-through":"none",color:done?"#9B7B7B":"#3D2C2C"}}>{ch.text}</div>
                        <div style={{fontWeight:800,fontSize:"0.82rem",color:"#5BBCD6"}}>+{ch.pts}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={S.toastWrap}><div style={S.toast(toast.show)}>{toast.msg}</div></div>
    </div>
  );
}

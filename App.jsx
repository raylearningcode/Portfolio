import { useState, useEffect, useRef, useCallback } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const DARK = {
  bg:"#090d1f",surface:"rgba(20,26,50,0.75)",surfaceHov:"rgba(24,31,58,0.97)",
  border:"rgba(0,240,255,0.11)",borderHov:"rgba(0,240,255,0.32)",
  text:"#f0f4ff",textMid:"rgba(220,228,255,0.62)",textDim:"rgba(200,215,255,0.3)",
  accent:"#00F0FF",green:"#00FF41",red:"#FF0055",gold:"#FFD700",
  navBg:"rgba(7,10,24,0.97)",inputBg:"rgba(4,7,18,0.8)",gridOp:0.055,
  shadow:"0 24px 64px rgba(0,0,0,0.55)",isDark:true,
};
const LIGHT = {
  bg:"#f2f5fd",surface:"rgba(255,255,255,0.9)",surfaceHov:"rgba(255,255,255,1)",
  border:"rgba(0,90,160,0.14)",borderHov:"rgba(0,90,160,0.38)",
  text:"#080c20",textMid:"rgba(8,12,32,0.62)",textDim:"rgba(8,12,32,0.36)",
  accent:"#0070b8",green:"#007828",red:"#c0002e",gold:"#9a6000",
  navBg:"rgba(242,245,253,0.97)",inputBg:"rgba(228,234,252,0.9)",gridOp:0.03,
  shadow:"0 12px 40px rgba(0,60,120,0.09)",isDark:false,
};

// ─── HOOKS ────────────────────────────────────────────────────────────────────
const useFadeIn=(d=0)=>{const[v,setV]=useState(false);useEffect(()=>{const t=setTimeout(()=>setV(true),d);return()=>clearTimeout(t);},[]);return{opacity:v?1:0,transform:v?"translateY(0)":"translateY(18px)",transition:`opacity 0.52s ease ${d}ms,transform 0.52s ease ${d}ms`};};
const useScrollFade=()=>{const ref=useRef(null);const[v,setV]=useState(false);useEffect(()=>{const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)setV(true);},{threshold:0.07});if(ref.current)obs.observe(ref.current);return()=>obs.disconnect();},[]);return[ref,{opacity:v?1:0,transform:v?"translateY(0)":"translateY(24px)",transition:"opacity 0.65s ease,transform 0.65s ease"}];};
const GC="!@#%^&*[]|;0123456789ABCDEF";
const useGlitch=t=>{const[v,setV]=useState(t);useEffect(()=>{let to;const run=()=>{let i=0;const iv=setInterval(()=>{setV(t.split("").map(c=>c===" "?" ":Math.random()>0.82?GC[Math.floor(Math.random()*GC.length)]:c).join(""));if(++i>8){clearInterval(iv);setV(t);to=setTimeout(run,7000);}},50);};to=setTimeout(run,3500);return()=>clearTimeout(to);},[]);return v;};

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
const Counter=({to,suffix=""})=>{
  const[n,setN]=useState(0);const ref=useRef(null);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{
      if(!e.isIntersecting)return;obs.disconnect();
      const dur=1200,start=Date.now();
      const tick=()=>{const p=Math.min((Date.now()-start)/dur,1);setN(Math.round(p*to));if(p<1)requestAnimationFrame(tick);};
      requestAnimationFrame(tick);
    },{threshold:0.3});
    if(ref.current)obs.observe(ref.current);return()=>obs.disconnect();
  },[to]);
  return <span ref={ref}>{n}{suffix}</span>;
};

// ─── CURSOR SPOTLIGHT ─────────────────────────────────────────────────────────
const CursorSpotlight=({dark})=>{
  const[pos,setPos]=useState({x:-500,y:-500});
  useEffect(()=>{const fn=e=>setPos({x:e.clientX,y:e.clientY});window.addEventListener("mousemove",fn);return()=>window.removeEventListener("mousemove",fn);},[]);
  if(!dark)return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
      background:`radial-gradient(350px circle at ${pos.x}px ${pos.y}px, rgba(0,240,255,0.04) 0%, transparent 70%)`,
      transition:"background 0.08s ease"}}/>
  );
};

// ─── SCROLL PROGRESS BAR ──────────────────────────────────────────────────────
const ScrollBar=({T})=>{
  const[p,setP]=useState(0);
  useEffect(()=>{const fn=()=>{const el=document.documentElement;setP((el.scrollTop/(el.scrollHeight-el.clientHeight))*100);};window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn);},[]);
  return <div style={{position:"fixed",top:0,left:0,zIndex:300,height:"2px",width:`${p}%`,background:`linear-gradient(90deg,${T.green},${T.accent})`,transition:"width 0.1s linear",boxShadow:`0 0 8px ${T.accent}80`}}/>;
};

// ─── COMMAND PALETTE ──────────────────────────────────────────────────────────
const CMDS=[
  {key:"init",label:"Go to Home",icon:"⌂",fn:n=>n("INIT")},
  {key:"about",label:"Go to About",icon:"◉",fn:n=>n("ABOUT")},
  {key:"arsenal",label:"Go to Skills",icon:"⚡",fn:n=>n("ARSENAL")},
  {key:"labs",label:"Go to Projects",icon:"⬡",fn:n=>n("LABS")},
  {key:"intel",label:"Go to Writeups",icon:"◈",fn:n=>n("INTEL")},
  {key:"contact",label:"Get in Touch",icon:"✉",fn:n=>n("CONTACT")},
  {key:"github",label:"Open GitHub",icon:"⌥",fn:()=>window.open("https://github.com/your-username","_blank")},
  {key:"linkedin",label:"Open LinkedIn",icon:"◫",fn:()=>window.open("https://linkedin.com/in/your-profile","_blank")},
  {key:"resume",label:"Download Resume",icon:"↓",fn:()=>window.open("#","_blank")},
  {key:"htb",label:"View HackTheBox Profile",icon:"⬡",fn:()=>window.open("https://app.hackthebox.com","_blank")},
];
const CommandPalette=({open,onClose,onNav,T})=>{
  const[q,setQ]=useState("");const[sel,setSel]=useState(0);
  const results=CMDS.filter(c=>c.label.toLowerCase().includes(q.toLowerCase()));
  useEffect(()=>{if(open)setQ(""),setSel(0);},[open]);
  useEffect(()=>{
    const fn=e=>{
      if(!open)return;
      if(e.key==="ArrowDown"){e.preventDefault();setSel(s=>Math.min(s+1,results.length-1));}
      if(e.key==="ArrowUp"){e.preventDefault();setSel(s=>Math.max(s-1,0));}
      if(e.key==="Enter"&&results[sel]){results[sel].fn(onNav);onClose();}
      if(e.key==="Escape")onClose();
    };
    window.addEventListener("keydown",fn);return()=>window.removeEventListener("keydown",fn);
  },[open,results,sel]);
  if(!open)return null;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:"20vh"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"480px",maxWidth:"90vw",background:T.isDark?"rgba(10,14,30,0.98)":T.navBg,border:`1px solid ${T.borderHov}`,borderRadius:"12px",overflow:"hidden",boxShadow:T.shadow}}>
        <div style={{padding:"0.75rem 1rem",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:"0.6rem"}}>
          <span style={{color:T.textDim,fontSize:"0.9rem"}}>⌘</span>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Type a command..." style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.text,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.82rem"}}/>
          <kbd style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.58rem",color:T.textDim,border:`1px solid ${T.border}`,padding:"0.1rem 0.4rem",borderRadius:"3px"}}>ESC</kbd>
        </div>
        <div style={{padding:"0.4rem"}}>
          {results.length===0&&<div style={{padding:"1rem",textAlign:"center",fontFamily:"Inter,sans-serif",fontSize:"0.78rem",color:T.textDim}}>No commands found</div>}
          {results.map((c,i)=>(
            <div key={c.key} onClick={()=>{c.fn(onNav);onClose();}} onMouseEnter={()=>setSel(i)}
              style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.65rem 0.8rem",borderRadius:"6px",cursor:"pointer",background:i===sel?`${T.accent}12`:"transparent",transition:"background 0.1s"}}>
              <span style={{fontSize:"0.9rem",width:"20px",textAlign:"center",color:T.accent}}>{c.icon}</span>
              <span style={{fontFamily:"Inter,sans-serif",fontSize:"0.82rem",color:i===sel?T.accent:T.text}}>{c.label}</span>
              {i===sel&&<kbd style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.55rem",color:T.textDim,border:`1px solid ${T.border}`,padding:"0.1rem 0.4rem",borderRadius:"3px"}}>↵</kbd>}
            </div>
          ))}
        </div>
        <div style={{padding:"0.5rem 1rem",borderTop:`1px solid ${T.border}`,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.52rem",color:T.textDim,display:"flex",gap:"1rem"}}>
          <span>↑↓ navigate</span><span>↵ select</span><span>esc close</span>
        </div>
      </div>
    </div>
  );
};

// ─── BACKGROUND ───────────────────────────────────────────────────────────────
const BG=({T})=>(
  <div style={{position:"fixed",inset:0,zIndex:0,overflow:"hidden",
    background:T.isDark?"linear-gradient(160deg,#090d1f 0%,#04061a 100%)":"linear-gradient(160deg,#edf0fc 0%,#f7f9ff 100%)",
    transition:"background 0.4s"}}>
    <svg width="100%" height="100%" style={{opacity:T.gridOp,position:"absolute",inset:0}}>
      <defs><pattern id="gp" width="44" height="44" patternUnits="userSpaceOnUse">
        <path d="M44 0L0 0 0 44" fill="none" stroke={T.accent} strokeWidth="0.6"/>
      </pattern></defs>
      <rect width="100%" height="100%" fill="url(#gp)"/>
    </svg>
    <div style={{position:"absolute",inset:0,background:T.isDark
      ?"radial-gradient(ellipse 60% 40% at 50% 0%,rgba(0,240,255,0.07),transparent 60%)"
      :"radial-gradient(ellipse 60% 40% at 50% 0%,rgba(0,112,184,0.05),transparent 60%)"}}/>
  </div>
);

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV_IDS=["INIT","ABOUT","ARSENAL","LABS","INTEL","CONTACT"];
const Navbar=({active,onNav,dark,toggleDark,T,onCmd})=>{
  const[solid,setSolid]=useState(false);const[open,setOpen]=useState(false);
  useEffect(()=>{const fn=()=>setSolid(window.scrollY>40);window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn);},[]);
  const close=id=>{onNav(id);setOpen(false);};
  return(<>
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,padding:"0 1.5rem",height:"54px",
      display:"flex",alignItems:"center",justifyContent:"space-between",
      background:solid?T.navBg:"transparent",backdropFilter:solid?"blur(18px)":"none",
      borderBottom:solid?`1px solid ${T.border}`:"none",transition:"all 0.3s ease",
      fontFamily:"'JetBrains Mono','Courier New',monospace"}}>
      <button onClick={()=>close("INIT")} style={{background:"none",border:"none",cursor:"pointer",padding:0}}>
        <span style={{color:T.green,fontSize:"0.78rem",fontWeight:700,fontFamily:"inherit"}}>rafi</span>
        <span style={{color:T.textDim,fontSize:"0.78rem",fontFamily:"inherit"}}>@sec</span>
        <span style={{color:T.accent,fontSize:"0.78rem",fontFamily:"inherit"}}>:~$</span>
      </button>
      <div style={{display:"flex",gap:"0.1rem",alignItems:"center"}}>
        <div className="desk-nav" style={{display:"flex",gap:"0.08rem"}}>
          {NAV_IDS.map(id=>(
            <button key={id} onClick={()=>close(id)} style={{
              background:active===id?`${T.accent}12`:"transparent",
              border:`1px solid ${active===id?T.accent+"38":"transparent"}`,
              color:active===id?T.accent:T.textDim,
              fontFamily:"inherit",fontSize:"0.58rem",letterSpacing:"0.12em",
              padding:"0.28rem 0.55rem",cursor:"pointer",borderRadius:"2px",transition:"all 0.15s"}}
              onMouseEnter={e=>{if(active!==id)e.currentTarget.style.color=T.textMid;}}
              onMouseLeave={e=>{if(active!==id)e.currentTarget.style.color=T.textDim;}}>
              {id}
            </button>
          ))}
        </div>
        {/* Command palette trigger */}
        <button onClick={onCmd} title="Command palette (⌘K)" style={{marginLeft:"0.5rem",display:"flex",alignItems:"center",gap:"0.3rem",background:`${T.accent}08`,border:`1px solid ${T.border}`,borderRadius:"5px",padding:"0.25rem 0.55rem",cursor:"pointer",transition:"all 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.background=`${T.accent}18`}
          onMouseLeave={e=>e.currentTarget.style.background=`${T.accent}08`}>
          <span style={{fontFamily:"inherit",fontSize:"0.56rem",color:T.textDim}}>⌘K</span>
        </button>
        <button onClick={toggleDark} title="Toggle theme" style={{marginLeft:"0.35rem",width:"31px",height:"31px",borderRadius:"6px",background:`${T.accent}08`,border:`1px solid ${T.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.85rem",transition:"all 0.18s"}}
          onMouseEnter={e=>e.currentTarget.style.background=`${T.accent}1a`}
          onMouseLeave={e=>e.currentTarget.style.background=`${T.accent}08`}>
          {dark?"☀️":"🌙"}
        </button>
        <button onClick={()=>setOpen(o=>!o)} className="ham-btn" style={{marginLeft:"0.35rem",background:"none",border:`1px solid ${T.border}`,color:T.text,cursor:"pointer",borderRadius:"4px",padding:"0.26rem 0.5rem",fontFamily:"inherit",fontSize:"1rem",display:"none"}}>
          {open?"✕":"☰"}
        </button>
      </div>
    </nav>
    {/* Mobile drawer */}
    <div style={{position:"fixed",top:"54px",left:0,right:0,zIndex:190,background:T.navBg,backdropFilter:"blur(18px)",borderBottom:`1px solid ${T.border}`,padding:open?"1rem 1.5rem":"0 1.5rem",maxHeight:open?"300px":"0",overflow:"hidden",transition:"all 0.28s ease",display:"flex",flexDirection:"column",gap:"0.4rem"}}>
      {NAV_IDS.map(id=>(
        <button key={id} onClick={()=>close(id)} style={{background:active===id?`${T.accent}12`:"transparent",border:`1px solid ${active===id?T.accent+"30":"transparent"}`,color:active===id?T.accent:T.textMid,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.75rem",letterSpacing:"0.12em",padding:"0.55rem 0.8rem",cursor:"pointer",borderRadius:"3px",textAlign:"left",transition:"all 0.15s"}}>{id}</button>
      ))}
    </div>
    <style>{`.desk-nav{display:flex!important;}@media(max-width:680px){.desk-nav{display:none!important;}.ham-btn{display:flex!important;}}`}</style>
  </>);
};

// ─── SECTION + LABEL ──────────────────────────────────────────────────────────
const Sec=({id,children,T,style={}})=>(
  <section id={id} style={{position:"relative",zIndex:1,padding:"5.5rem 1.5rem 4rem",maxWidth:"1100px",margin:"0 auto",...style}}>{children}</section>
);
const Label=({n,text,T})=>(
  <div style={{marginBottom:"2.5rem"}}>
    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.57rem",color:T.green,letterSpacing:"0.22em",marginBottom:"0.4rem"}}>{String(n).padStart(2,"0")} / 05 ── {text}</div>
    <div style={{width:"36px",height:"1px",background:T.accent,boxShadow:`0 0 8px ${T.accent}80`}}/>
  </div>
);

// ─── HERO ─────────────────────────────────────────────────────────────────────
const PHOTO_URL=null; // Replace with your image URL

const Hero=({onNav,T})=>{
  const title=useGlitch("THE SECURITY ENGINEER'S JOURNEY");
  const f0=useFadeIn(0),f1=useFadeIn(90),f2=useFadeIn(200),f3=useFadeIn(310),f4=useFadeIn(420);
  return(
    <Sec id="INIT" T={T} style={{minHeight:"100vh",display:"flex",alignItems:"center"}}>
      <div className="hero-grid" style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"3rem",alignItems:"center",width:"100%"}}>
        <div style={{minWidth:0}}>
          <div style={{...f0,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.62rem",color:T.green,letterSpacing:"0.22em",marginBottom:"1.1rem"}}>
            <span style={{opacity:0.45}}>~/</span>security-engineer
          </div>
          <div style={{...f1,marginBottom:"0.65rem"}}>
            <h1 style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"clamp(2.2rem,6vw,4.6rem)",fontWeight:800,color:T.text,lineHeight:1.04,margin:0}}>
              Rafi<span style={{color:T.accent}}>.</span>
            </h1>
          </div>
          <div style={{...f2,marginBottom:"1.6rem"}}>
            <p style={{fontFamily:"Inter,sans-serif",fontSize:"clamp(0.92rem,1.9vw,1.22rem)",color:T.textMid,margin:0,lineHeight:1.65}}>
              CS student building <span style={{color:T.accent}}>security tools</span>, CTF writeups &amp; full-stack projects.<br/>
              <span style={{fontSize:"0.87em",color:T.textDim}}>Indonesia 🇮🇩 &nbsp;→&nbsp; Taiwan 🇹🇼 &nbsp;→&nbsp; Germany 🇩🇪 (M.Sc. Cybersecurity)</span>
            </p>
          </div>
          <div style={{...f3,display:"flex",flexWrap:"wrap",gap:"0.4rem",marginBottom:"2rem"}}>
            {["Security Research","Python","CTF Competitor","Web Dev","Open to Internships"].map(t=>(
              <span key={t} style={{fontFamily:"'Fira Code',monospace",fontSize:"0.65rem",color:T.isDark?"rgba(0,240,255,0.75)":T.accent,background:`${T.accent}09`,border:`1px solid ${T.accent}22`,padding:"0.25rem 0.68rem",borderRadius:"20px",transition:"all 0.15s",cursor:"default"}}
                onMouseEnter={e=>{e.currentTarget.style.background=`${T.accent}18`;e.currentTarget.style.borderColor=`${T.accent}55`;}}
                onMouseLeave={e=>{e.currentTarget.style.background=`${T.accent}09`;e.currentTarget.style.borderColor=`${T.accent}22`;}}>{t}</span>
            ))}
          </div>
          <div style={{...f4,display:"flex",gap:"0.75rem",flexWrap:"wrap"}}>
            <button onClick={()=>onNav("LABS")} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.63rem",letterSpacing:"0.14em",padding:"0.72rem 1.5rem",borderRadius:"4px",cursor:"pointer",transition:"all 0.2s",background:`${T.accent}12`,border:`1px solid ${T.accent}`,color:T.accent,boxShadow:`0 0 20px ${T.accent}18`}}
              onMouseEnter={e=>{e.currentTarget.style.background=`${T.accent}22`;e.currentTarget.style.boxShadow=`0 0 32px ${T.accent}28`;}}
              onMouseLeave={e=>{e.currentTarget.style.background=`${T.accent}12`;e.currentTarget.style.boxShadow=`0 0 20px ${T.accent}18`;}}>
              VIEW PROJECTS →
            </button>
            <button onClick={()=>onNav("INTEL")} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.63rem",letterSpacing:"0.14em",padding:"0.72rem 1.5rem",borderRadius:"4px",cursor:"pointer",transition:"all 0.2s",background:"transparent",border:`1px solid ${T.border}`,color:T.textMid}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.textMid;e.currentTarget.style.color=T.text;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textMid;}}>
              READ WRITEUPS
            </button>
            <a href="#" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.63rem",letterSpacing:"0.14em",padding:"0.72rem 1.5rem",borderRadius:"4px",transition:"all 0.2s",textDecoration:"none",background:"transparent",border:`1px solid ${T.green}40`,color:T.green,display:"inline-flex",alignItems:"center"}}
              onMouseEnter={e=>e.currentTarget.style.background=`${T.green}12`}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>↓ RESUME</a>
          </div>
          <div style={{marginTop:"3.5rem",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.49rem",color:T.textDim,letterSpacing:"0.2em",opacity:0.4}}>{title}</div>
        </div>

        {/* Photo */}
        <div className="hero-photo" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"1rem",flexShrink:0}}>
          <div style={{width:"192px",height:"192px",borderRadius:"20px",overflow:"hidden",flexShrink:0,border:`2px solid ${T.accent}28`,boxShadow:`0 0 0 8px ${T.accent}06,${T.shadow}`,background:T.isDark?"rgba(20,26,50,0.9)":"rgba(200,215,240,0.5)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",transition:"box-shadow 0.3s"}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 0 0 8px ${T.accent}12, 0 28px 70px rgba(0,0,0,0.6)`}
            onMouseLeave={e=>e.currentTarget.style.boxShadow=`0 0 0 8px ${T.accent}06,${T.shadow}`}>
            {PHOTO_URL?<img src={PHOTO_URL} alt="Rafi" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              :<div style={{textAlign:"center",padding:"1rem"}}>
                <div style={{width:"72px",height:"72px",borderRadius:"50%",background:`linear-gradient(135deg,${T.accent}30,${T.green}20)`,margin:"0 auto 0.7rem",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${T.accent}30`,fontSize:"1.6rem"}}>👤</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.5rem",color:T.textDim,letterSpacing:"0.1em"}}>YOUR PHOTO</div>
                <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.44rem",color:T.textDim,marginTop:"0.15rem",opacity:0.55}}>Set PHOTO_URL</div>
              </div>}
            <div style={{position:"absolute",top:0,left:0,width:"16px",height:"16px",borderTop:`2px solid ${T.accent}`,borderLeft:`2px solid ${T.accent}`,borderRadius:"4px 0 0 0"}}/>
            <div style={{position:"absolute",bottom:0,right:0,width:"16px",height:"16px",borderBottom:`2px solid ${T.accent}`,borderRight:`2px solid ${T.accent}`,borderRadius:"0 0 4px 0"}}/>
          </div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.56rem",letterSpacing:"0.1em",color:T.green,border:`1px solid ${T.green}35`,background:`${T.green}09`,padding:"0.28rem 0.8rem",borderRadius:"20px",display:"flex",alignItems:"center",gap:"0.4rem"}}>
            <span style={{width:"6px",height:"6px",borderRadius:"50%",background:T.green,display:"inline-block",animation:"pulse 2s infinite",boxShadow:`0 0 6px ${T.green}`}}/>OPEN TO WORK
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.85)}}
        @media(max-width:680px){.hero-photo{display:none!important;}.hero-grid{grid-template-columns:1fr!important;}}
      `}</style>
    </Sec>
  );
};

// ─── HTB WIDGET ───────────────────────────────────────────────────────────────
const HTB_USER="your-htb-username"; // ← set your username
const HTBCard=({T})=>{
  const[d,setD]=useState(null);const[demo,setDemo]=useState(false);
  useEffect(()=>{
    (async()=>{try{const r=await fetch(`https://www.hackthebox.com/api/v4/user/profile/basic/${HTB_USER}`,{headers:{"Accept":"application/json"}});if(!r.ok)throw 0;setD((await r.json()).profile);}catch{setD({rank_text:"Hacker",points:420,user_owns:12,system_owns:4});setDemo(true);}})();
  },[]);
  const[ref,fade]=useScrollFade();
  return(
    <div ref={ref} style={{...fade,background:T.surface,border:`1px solid rgba(159,239,0,0.2)`,borderRadius:"10px",padding:"1.2rem",backdropFilter:"blur(10px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:"0.7rem",marginBottom:"1rem",paddingBottom:"0.7rem",borderBottom:`1px solid ${T.border}`}}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#9FEF00" strokeWidth="1.5" fill="none"/>
          <path d="M12 2v20M3 7l9 5 9-5" stroke="#9FEF00" strokeWidth="0.8" opacity="0.4"/>
        </svg>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.65rem",color:"#9FEF00",letterSpacing:"0.1em",fontWeight:700}}>HackTheBox</div>
          <div style={{fontFamily:"Inter,sans-serif",fontSize:"0.57rem",color:T.textDim}}>{demo?"demo mode — set HTB_USER":"live stats"}</div>
        </div>
        {d&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.62rem",color:"#9FEF00",background:"rgba(159,239,0,0.08)",border:"1px solid rgba(159,239,0,0.2)",padding:"0.18rem 0.55rem",borderRadius:"20px"}}>{d.rank_text||"—"}</div>}
      </div>
      {!d?<div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.65rem",color:T.textDim}}>Fetching rank...</div>
        :<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.55rem"}}>
          {[[d.points??0,"POINTS",T.accent],[d.user_owns??0,"USER OWNS","#FFD700"],[d.system_owns??0,"ROOT OWNS","#FF0055"],["🔒","BADGES","#A855F7"]].map(([v,l,c])=>(
            <div key={l} style={{background:T.isDark?"rgba(0,0,0,0.2)":"rgba(0,0,0,0.04)",borderRadius:"7px",padding:"0.6rem",textAlign:"center"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"1.05rem",color:c,fontWeight:700}}>{v}</div>
              <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.5rem",color:T.textDim,marginTop:"0.18rem"}}>{l}</div>
            </div>
          ))}
        </div>}
      <a href={`https://app.hackthebox.com/users/${HTB_USER}`} target="_blank" rel="noreferrer" style={{display:"block",marginTop:"0.8rem",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.55rem",color:"#9FEF00",textDecoration:"none",textAlign:"center",opacity:0.6}}>VIEW FULL PROFILE ↗</a>
    </div>
  );
};

// ─── ABOUT ────────────────────────────────────────────────────────────────────
const TL=[
  {year:"2002",icon:"🇮🇩",title:"Born in Indonesia",detail:"Grew up taking apart every gadget I could find."},
  {year:"2022",icon:"🇹🇼",title:"CS Degree, Taiwan",detail:"Algorithms, OS, networking, first security fundamentals."},
  {year:"2023",icon:"⚔️",title:"First CTF Competition",detail:"Web exploitation and forensics. Top 30% finish."},
  {year:"2024",icon:"🛠️",title:"Shipping Real Projects",detail:"Security tools, Python automation, web apps."},
  {year:"2025",icon:"📡",title:"This Portfolio",detail:"Documenting the journey publicly."},
  {year:"2026+",icon:"🇩🇪",title:"Goal: M.Sc. Cybersecurity, Germany",detail:"Targeting TU Berlin, KIT, or RWTH Aachen. Learning German daily — A2 → B1."},
];
const About=({T})=>{
  const[ref,fade]=useScrollFade();
  return(
    <Sec id="ABOUT" T={T}>
      <Label n={1} text="ABOUT // THE JOURNEY" T={T}/>
      <div ref={ref} style={{...fade}}>
        <div className="about-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3.5rem",alignItems:"start"}}>
          <div>
            <h2 style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"clamp(1.3rem,2.8vw,2rem)",fontWeight:700,color:T.text,lineHeight:1.25,marginBottom:"1.3rem"}}>
              Student. Builder.<br/><span style={{color:T.accent}}>Future Security</span> Engineer.
            </h2>
            <p style={{fontFamily:"Inter,sans-serif",fontSize:"0.88rem",color:T.textMid,lineHeight:1.9,marginBottom:"1rem"}}>
              I'm <strong style={{color:T.text}}>Rafi</strong> — a CS student in Taiwan from Indonesia, focused on <strong style={{color:T.accent}}>cybersecurity, Python automation, and full-stack development</strong>. I'm building a portfolio around safe lab practice, CTF documentation, and small tools that explain how systems work.
            </p>
            <p style={{fontFamily:"Inter,sans-serif",fontSize:"0.88rem",color:T.textMid,lineHeight:1.9,marginBottom:"1.8rem"}}>
              My current focus is web security fundamentals, Linux, networking, Python scripting, and technical writing. I use this portfolio to document what I build, what I learn, and how I think through technical problems.
            </p>

            {/* Animated stat cards */}
            <div className="stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.85rem",marginBottom:"1.8rem"}}>
              {[{to:10,suffix:"+",sub:"Projects"},{to:47,suffix:"",sub:"CTF Solves"},{to:3,suffix:"",sub:"Languages"}].map(s=>(
                <div key={s.sub} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"10px",padding:"1rem",textAlign:"center",backdropFilter:"blur(8px)",transition:"transform 0.2s,box-shadow 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 24px ${T.accent}12`;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"1.55rem",color:T.accent,fontWeight:800}}>
                    <Counter to={s.to} suffix={s.suffix}/>
                  </div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:"0.63rem",color:T.textDim,marginTop:"0.2rem"}}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{padding:"1rem 1.2rem",background:`${T.green}07`,border:`1px solid ${T.green}20`,borderRadius:"8px",marginBottom:"1rem"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.54rem",color:T.green,letterSpacing:"0.15em",marginBottom:"0.65rem"}}>// CURRENTLY</div>
              {["📚 Studying: eJPT cert + German (A2 → B1)","🛠️ Building: CTF vault + Python security tools","🎯 Goal: M.Sc. Cybersecurity, Germany 2026"].map(l=>(
                <div key={l} style={{fontFamily:"Inter,sans-serif",fontSize:"0.82rem",color:T.textMid,lineHeight:2}}>{l}</div>
              ))}
            </div>
            {/* Ethical framing — MD §20 requirement */}
            <div style={{padding:"0.85rem 1.1rem",background:`${T.isDark?"rgba(255,0,85,0.04)":"rgba(180,0,50,0.03)"}`,border:`1px solid ${T.red}20`,borderRadius:"8px"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.52rem",color:T.red,letterSpacing:"0.15em",marginBottom:"0.5rem"}}>// SECURITY SCOPE</div>
              <div style={{fontFamily:"Inter,sans-serif",fontSize:"0.78rem",color:T.textMid,lineHeight:1.75}}>All security projects and writeups are built for authorized labs, CTF environments, or local learning setups. I focus on understanding systems, documenting methods, and improving defensive awareness.</div>
            </div>
          </div>

          <div>
            <div style={{position:"relative",paddingLeft:"1.5rem",marginBottom:"2rem"}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:"1px",background:`linear-gradient(to bottom,${T.accent},${T.green},transparent)`}}/>
              {TL.map((t,i)=>(
                <div key={i} style={{position:"relative",marginBottom:"1.4rem",transition:"opacity 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                  onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                  <div style={{position:"absolute",left:"-1.5rem",top:"4px",width:"9px",height:"9px",borderRadius:"50%",background:i===TL.length-1?T.green:T.accent,boxShadow:`0 0 10px ${i===TL.length-1?T.green:T.accent}`,transition:"transform 0.2s"}}/>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.6rem",color:T.green}}>{t.year}</div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:"0.8rem",color:T.text,fontWeight:600,margin:"0.1rem 0"}}>{t.icon} {t.title}</div>
                  <div style={{fontFamily:"Inter,sans-serif",fontSize:"0.72rem",color:T.textDim,lineHeight:1.6}}>{t.detail}</div>
                </div>
              ))}
            </div>
            <HTBCard T={T}/>
          </div>
        </div>
      </div>
    </Sec>
  );
};

// ─── ARSENAL ──────────────────────────────────────────────────────────────────
// Evidence-based skill cards (MD §10: replace % bars with proof)
const SK=[
  {cat:"SECURITY",c:"#FF0055",level:"Working",
   proof:"CTFs, OWASP labs, authorized local test environments",
   items:["Web exploitation (SQLi, XSS, Auth bypass)","Network packet analysis with Scapy + Wireshark","OSINT & recon methodology","Linux CLI & Bash scripting","CTF forensics & cryptography"]},
  {cat:"PYTHON & SCRIPTING",c:"#00FF41",level:"Confident",
   proof:"NetWatch, PassForge, SecLearn Bot — all on GitHub",
   items:["CLI security tooling (Scapy, Rich, argparse)","Telegram bot automation with APScheduler","SQLite data persistence","REST API consumption","Entropy & pattern analysis"]},
  {cat:"WEB & DESIGN",c:"#00F0FF",level:"Confident",
   proof:"This portfolio, CTF Writeup Vault, CyberUI Kit",
   items:["React / Next.js + TypeScript","Tailwind CSS + responsive design","MDX-powered content platforms","Component libraries & design systems","Figma prototyping"]},
  {cat:"LANGUAGES",c:"#FFD700",level:"Multilingual",
   proof:"Native Indonesian, professional English, learning Mandarin + German",
   items:["Indonesian 🇮🇩 — Native","English 🇺🇸 — Professional","Mandarin 🇹🇼 — Intermediate (HSK 3)","German 🇩🇪 — Beginner (A2 → B1 target)"]},
];
const LEVEL_COLORS={"Working":"#FFD700","Confident":"#00FF41","Multilingual":"#00F0FF"};
const Arsenal=({T})=>{
  const[ref,fade]=useScrollFade();
  return(
    <Sec id="ARSENAL" T={T}>
      <Label n={2} text="ARSENAL // SKILLS & TOOLS" T={T}/>
      <div ref={ref} style={{...fade,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"1.1rem"}}>
        {SK.map(g=>(
          <div key={g.cat} style={{background:T.surface,border:`1px solid ${g.c}18`,borderRadius:"10px",padding:"1.4rem",backdropFilter:"blur(10px)",transition:"box-shadow 0.22s,transform 0.22s",display:"flex",flexDirection:"column"}}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 8px 30px ${g.c}14`;e.currentTarget.style.transform="translateY(-3px)";}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";}}>
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.9rem",paddingBottom:"0.7rem",borderBottom:`1px solid ${g.c}20`}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.57rem",color:g.c,letterSpacing:"0.18em"}}>[{g.cat}]</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.52rem",color:LEVEL_COLORS[g.level]||g.c,border:`1px solid ${(LEVEL_COLORS[g.level]||g.c)}35`,padding:"0.1rem 0.45rem",borderRadius:"20px"}}>{g.level}</span>
            </div>
            {/* Skills list */}
            {g.items.map(item=>(
              <div key={item} style={{display:"flex",alignItems:"flex-start",gap:"0.5rem",marginBottom:"0.55rem"}}>
                <span style={{color:g.c,fontSize:"0.6rem",marginTop:"0.12rem",flexShrink:0}}>▸</span>
                <span style={{fontFamily:"Inter,sans-serif",fontSize:"0.8rem",color:T.textMid,lineHeight:1.5}}>{item}</span>
              </div>
            ))}
            {/* Proof line */}
            <div style={{marginTop:"auto",paddingTop:"0.8rem",borderTop:`1px solid ${T.border}`}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.52rem",color:T.textDim,letterSpacing:"0.08em",marginBottom:"0.2rem"}}>PROOF</div>
              <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.68rem",color:g.c,opacity:0.75,lineHeight:1.5}}>{g.proof}</div>
            </div>
          </div>
        ))}
      </div>
    </Sec>
  );
};

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
const CATS=["ALL","SECURITY","PYTHON","WEB DESIGN","FULLSTACK"];
const CC={ALL:"#aaa",SECURITY:"#FF0055",PYTHON:"#00FF41","WEB DESIGN":"#00F0FF",FULLSTACK:"#FFD700"};
const PROJS=[
  {id:"01",cat:"SECURITY", n:"NetWatch",         tl:"Live Network Packet Analyzer",       desc:"Python CLI that captures packets in real-time, detects suspicious patterns, outputs color-coded protocol breakdowns. Built with Scapy and Rich.",        tags:["Python","Scapy","Network Security","CLI"],   st:"ACTIVE",   sc:"#00FF41",gh:"#",dm:"#"},
  {id:"02",cat:"SECURITY", n:"SQLi Scanner",     tl:"Automated SQL Injection Detector",   desc:"Fires 40+ payload variants on intentionally vulnerable lab targets (DVWA, bWAPP only). Detects error-based and blind SQLi, generates a severity report. Authorized lab use only.",                     tags:["Python","Web Security","OWASP","Lab Scope"],             st:"LAB",      sc:"#FF0055",gh:"#"},
  {id:"03",cat:"PYTHON",   n:"SecLearn Bot",     tl:"Telegram Security Quiz Bot",         desc:"Daily cybersecurity questions via Telegram, streak tracking with SQLite, weekly progress digests. 50+ questions in bank.",                              tags:["Python","Telegram API","SQLite"],            st:"COMPLETE", sc:"#00F0FF",gh:"#"},
  {id:"04",cat:"PYTHON",   n:"PassForge",        tl:"Password Strength Analyzer",         desc:"CLI scoring passwords by entropy, pattern detection, and wordlist lookup. Explains exactly why a password is weak and how to fix it.",                  tags:["Python","Entropy","CLI","Security"],         st:"COMPLETE", sc:"#00F0FF",gh:"#"},
  {id:"05",cat:"WEB DESIGN",n:"CyberUI Kit",     tl:"Hacker-Aesthetic React Components",  desc:"Dark-mode component library: terminal windows, glitch text, scan-bar loaders, status badges. Built for security dashboards and CTF tools.",             tags:["React","Tailwind","Framer Motion","Figma"],  st:"BUILDING", sc:"#FFD700",gh:"#",dm:"#"},
  {id:"06",cat:"WEB DESIGN",n:"PortfolioOS",     tl:"OS-Style Interactive Portfolio",     desc:"Portfolio styled as a fake OS — draggable windows, file manager, working terminal, taskbar. Pure CSS + Vanilla JS, zero dependencies.",                 tags:["HTML","CSS","Vanilla JS","UI Design"],       st:"BUILDING", sc:"#FFD700",gh:"#",dm:"#"},
  {id:"07",cat:"FULLSTACK",n:"CTF Writeup Vault",tl:"Searchable Knowledge Base Platform", desc:"Next.js site for publishing CTF writeups. MDX articles, tag filtering, full-text search, syntax highlighting. 20+ posts live.",                        tags:["Next.js","TypeScript","MDX","Supabase"],     st:"ACTIVE",   sc:"#00FF41",gh:"#",dm:"#"},
  {id:"08",cat:"FULLSTACK",n:"Malware Sandbox",  tl:"Dynamic Malware Analysis Lab",       desc:"Controlled, isolated VM environment using Cuckoo Sandbox. Analyzes behavioral patterns defensively — syscalls, network calls, file mutations. All samples from authorized sources only.",               tags:["Cuckoo","Linux","VM","Defensive"],              st:"LAB",      sc:"#FF0055",gh:"#"},
];
const Card=({p,T,idx})=>{
  const[hov,setHov]=useState(false);const cc=CC[p.cat]||"#aaa";
  const[ref,fade]=useScrollFade();
  return(
    <div ref={ref} style={{...fade,transitionDelay:`${idx*55}ms`}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{background:hov?T.surfaceHov:T.surface,border:`1px solid ${hov?cc+"45":T.border}`,borderRadius:"10px",padding:"1.35rem",transition:"all 0.25s ease",transform:hov?"translateY(-5px)":"none",boxShadow:hov?`0 14px 40px ${cc}12,${T.shadow}`:"none",display:"flex",flexDirection:"column",backdropFilter:"blur(10px)",height:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.8rem"}}>
          <div style={{display:"flex",gap:"0.4rem",alignItems:"center"}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.52rem",color:T.textDim}}>#{p.id}</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.52rem",color:cc,border:`1px solid ${cc}28`,padding:"0.08rem 0.3rem",borderRadius:"2px"}}>{p.cat}</span>
          </div>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.52rem",color:p.sc,border:`1px solid ${p.sc}35`,padding:"0.08rem 0.36rem",borderRadius:"2px"}}>{p.st}</span>
        </div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.95rem",color:T.accent,fontWeight:700,marginBottom:"0.18rem"}}>{p.n}</div>
        <div style={{fontFamily:"Inter,sans-serif",fontSize:"0.7rem",color:T.textDim,marginBottom:"0.75rem"}}>{p.tl}</div>
        <div style={{fontFamily:"Inter,sans-serif",fontSize:"0.875rem",color:T.textMid,lineHeight:1.78,marginBottom:"1rem",flex:1}}>{p.desc}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem",marginBottom:(p.gh||p.dm)?"0.85rem":0}}>
          {p.tags.map(t=><span key={t} style={{fontFamily:"'Fira Code',monospace",fontSize:"0.57rem",color:T.accent,background:`${T.accent}08`,border:`1px solid ${T.accent}14`,padding:"0.1rem 0.38rem",borderRadius:"2px"}}>{t}</span>)}
        </div>
        {(p.gh||p.dm)&&<div style={{display:"flex",gap:"0.5rem"}}>
          {p.gh&&<a href={p.gh} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.57rem",color:T.accent,textDecoration:"none",border:`1px solid ${T.accent}22`,padding:"0.2rem 0.65rem",borderRadius:"3px",transition:"all 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=`${T.accent}12`}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>GitHub ↗</a>}
          {p.dm&&<a href={p.dm} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.57rem",color:T.green,textDecoration:"none",border:`1px solid ${T.green}22`,padding:"0.2rem 0.65rem",borderRadius:"3px",transition:"all 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=`${T.green}12`}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Live ↗</a>}
        </div>}
      </div>
    </div>
  );
};
const Labs=({T})=>{
  const[cat,setCat]=useState("ALL");
  const list=cat==="ALL"?PROJS:PROJS.filter(p=>p.cat===cat);
  return(
    <Sec id="LABS" T={T}>
      <Label n={3} text="LABS // PROJECTS" T={T}/>
      <p style={{fontFamily:"Inter,sans-serif",fontSize:"0.9rem",color:T.textMid,lineHeight:1.75,marginBottom:"2rem",marginTop:"-1rem"}}>
        Selected projects. Each includes documentation, source code, and a short explanation of what I learned.
      </p>
      <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem",marginBottom:"2rem",alignItems:"center"}}>
        {CATS.map(c=>{const cc=CC[c]||"#aaa";return(
          <button key={c} onClick={()=>setCat(c)} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.57rem",letterSpacing:"0.1em",padding:"0.28rem 0.75rem",borderRadius:"3px",cursor:"pointer",transition:"all 0.15s",background:cat===c?`${cc}14`:"transparent",border:`1px solid ${cat===c?cc:T.border}`,color:cat===c?cc:T.textDim}}>{c}</button>
        );})}
        <span style={{fontFamily:"'Fira Code',monospace",fontSize:"0.6rem",color:T.textDim,marginLeft:"0.3rem"}}>{list.length} projects</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(295px,1fr))",gap:"1rem"}}>
        {list.map((p,i)=><Card key={p.id} p={p} T={T} idx={i}/>)}
      </div>
    </Sec>
  );
};

// ─── WRITEUPS ─────────────────────────────────────────────────────────────────
const WC={WEB:"#00FF41",FORENSICS:"#00F0FF",NETWORK:"#FFD700",CRYPTO:"#FF0055",OSINT:"#A855F7",PYTHON:"#F97316"};
const WUS=[
  {date:"2025-05-10",cat:"WEB",     title:"Bypassing JWT Auth — From None Algorithm to Admin",       tags:["JWT","Auth Bypass","CTF"],     read:"8 min"},
  {date:"2025-04-22",cat:"FORENSICS",title:"Memory Dump Analysis — Recovering Creds from RAM",       tags:["Volatility","DFIR","Memory"],  read:"12 min"},
  {date:"2025-04-05",cat:"NETWORK", title:"Wireshark Deep Dive — Spotting C2 Beacon Traffic",        tags:["Wireshark","C2","Analysis"],   read:"10 min"},
  {date:"2025-03-18",cat:"CRYPTO",  title:"RSA Weak Keys — When Small e Breaks Everything",          tags:["RSA","Math","CTF"],            read:"15 min"},
  {date:"2025-02-28",cat:"OSINT",   title:"Building a Target Profile from Zero",                     tags:["OSINT","Recon","Tools"],       read:"7 min"},
  {date:"2025-02-10",cat:"PYTHON",  title:"Automating Recon: Shodan + WHOIS in 50 Lines",            tags:["Python","Shodan","Auto"],      read:"9 min"},
];
const Intel=({T})=>{
  const[ref,fade]=useScrollFade();
  return(
    <Sec id="INTEL" T={T}>
      <Label n={4} text="INTEL // WRITEUPS & BLOG" T={T}/>
      <p style={{fontFamily:"Inter,sans-serif",fontSize:"0.9rem",color:T.textMid,lineHeight:1.75,marginBottom:"1.5rem",marginTop:"-1rem"}}>
        Short technical notes from CTF labs, networking practice, and security tooling experiments. Each writeup focuses on method, scope, and defensive lessons.
      </p>
      <div ref={ref} style={{...fade,border:`1px solid ${T.border}`,borderRadius:"10px",overflow:"hidden",backdropFilter:"blur(10px)"}}>
        {WUS.map((w,i)=>(
          <div key={i} className="wu-row" style={{display:"grid",gridTemplateColumns:"78px 66px 1fr 54px",alignItems:"center",gap:"1rem",padding:"0.88rem 1.2rem",background:T.surface,borderBottom:i<WUS.length-1?`1px solid ${T.border}`:"none",cursor:"pointer",transition:"background 0.15s,transform 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.background=T.surfaceHov;e.currentTarget.style.paddingLeft="1.4rem";}}
            onMouseLeave={e=>{e.currentTarget.style.background=T.surface;e.currentTarget.style.paddingLeft="1.2rem";}}>
            <div className="wu-date" style={{fontFamily:"'Fira Code',monospace",fontSize:"0.57rem",color:T.textDim}}>{w.date}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.53rem",color:WC[w.cat]||T.accent,border:`1px solid ${(WC[w.cat]||T.accent)}28`,padding:"0.1rem 0.32rem",borderRadius:"2px",textAlign:"center"}}>{w.cat}</div>
            <div>
              <div style={{fontFamily:"Inter,sans-serif",fontSize:"0.9rem",color:T.text,fontWeight:500,marginBottom:"0.18rem"}}>{w.title}</div>
              <div style={{display:"flex",gap:"0.45rem",flexWrap:"wrap"}}>
                {w.tags.map(t=><span key={t} style={{fontFamily:"'Fira Code',monospace",fontSize:"0.55rem",color:T.textDim}}>#{t}</span>)}
              </div>
            </div>
            <div className="wu-read" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.55rem",color:T.textDim,textAlign:"right"}}>{w.read}</div>
          </div>
        ))}
      </div>
      <div style={{textAlign:"center",marginTop:"1.1rem"}}>
        <button style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.15em",color:T.accent,background:"transparent",border:`1px solid ${T.border}`,padding:"0.52rem 1.4rem",borderRadius:"3px",cursor:"pointer",transition:"all 0.2s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.boxShadow=`0 0 16px ${T.accent}18`;e.currentTarget.style.color=T.accent;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.boxShadow="none";}}>
          VIEW ALL WRITEUPS ↗
        </button>
      </div>
    </Sec>
  );
};

// ─── CONTACT ──────────────────────────────────────────────────────────────────
const LKS=[
  {l:"EMAIL",   v:"rafi@example.com",            h:"mailto:rafi@example.com"},
  {l:"GITHUB",  v:"github.com/your-username",    h:"#"},
  {l:"LINKEDIN",v:"linkedin.com/in/your-profile",h:"#"},
  {l:"HTB",     v:"hackthebox.com/users/...",    h:"#"},
];
const Contact=({T})=>{
  const[ref,fade]=useScrollFade();
  return(
    <Sec id="CONTACT" T={T}>
      <Label n={5} text="CONTACT // SECURE CHANNEL" T={T}/>
      <div ref={ref} style={{...fade}}>
        <div className="contact-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3.5rem",alignItems:"start"}}>
          <div>
            <h2 style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"clamp(1.2rem,2.5vw,1.75rem)",color:T.text,fontWeight:700,lineHeight:1.35,marginBottom:"1rem"}}>
              Open to <span style={{color:T.accent}}>internships,</span><br/>collaborations &<br/><span style={{color:T.green}}>cool conversations.</span>
            </h2>
            <p style={{fontFamily:"Inter,sans-serif",fontSize:"0.9rem",color:T.textMid,lineHeight:1.85,marginBottom:"2rem"}}>
              Whether you're a recruiter, professor, fellow CTF player, or just someone building cool things — I respond to every serious inquiry.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>
              {LKS.map(l=>(
                <a key={l.l} href={l.h} style={{display:"flex",gap:"1rem",alignItems:"center",textDecoration:"none",padding:"0.5rem 0.7rem",borderRadius:"5px",border:`1px solid transparent`,transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background=T.surface;e.currentTarget.style.borderColor=T.border;e.currentTarget.style.paddingLeft="1rem";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="transparent";e.currentTarget.style.paddingLeft="0.7rem";}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.54rem",color:T.green,width:"58px",letterSpacing:"0.1em",flexShrink:0}}>{l.l}</span>
                  <span style={{fontFamily:"'Fira Code',monospace",fontSize:"0.73rem",color:T.textMid}}>{l.v}</span>
                </a>
              ))}
            </div>
          </div>
          {/* MD §13: Direct links only — no fake form */}
          <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"10px",padding:"1.6rem",backdropFilter:"blur(12px)",display:"flex",flexDirection:"column",gap:"0.7rem"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.57rem",color:T.green,letterSpacing:"0.15em",marginBottom:"0.4rem"}}>// REACH_ME.sh</div>
            {[
              {icon:"✉",label:"EMAIL",val:"rafi@example.com",href:"mailto:rafi@example.com",color:T.accent},
              {icon:"⌥",label:"GITHUB",val:"github.com/your-username",href:"https://github.com/your-username",color:T.green},
              {icon:"◫",label:"LINKEDIN",val:"linkedin.com/in/your-profile",href:"https://linkedin.com/in/your-profile",color:"#0A66C2"},
              {icon:"⬡",label:"HACKTHEBOX",val:"hackthebox.com/profile",href:"https://app.hackthebox.com",color:"#9FEF00"},
              {icon:"↓",label:"RESUME",val:"Download PDF",href:"#",color:T.gold},
            ].map(l=>(
              <a key={l.label} href={l.href} target={l.href.startsWith("mailto")?"_self":"_blank"} rel="noreferrer"
                style={{display:"flex",alignItems:"center",gap:"1rem",padding:"0.75rem 1rem",borderRadius:"7px",border:`1px solid ${T.border}`,textDecoration:"none",transition:"all 0.18s",background:"transparent"}}
                onMouseEnter={e=>{e.currentTarget.style.background=`${l.color}10`;e.currentTarget.style.borderColor=`${l.color}45`;e.currentTarget.style.transform="translateX(4px)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="none";}}>
                <span style={{width:"28px",height:"28px",borderRadius:"6px",background:`${l.color}14`,border:`1px solid ${l.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",flexShrink:0}}>{l.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.54rem",color:l.color,letterSpacing:"0.1em"}}>{l.label}</div>
                  <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.75rem",color:T.textMid}}>{l.val}</div>
                </div>
                <span style={{color:T.textDim,fontSize:"0.7rem"}}>↗</span>
              </a>
            ))}
            <div style={{marginTop:"0.5rem",padding:"0.75rem",background:`${T.isDark?"rgba(0,240,255,0.04)":"rgba(0,112,184,0.04)"}`,borderRadius:"6px",border:`1px solid ${T.border}`}}>
              <div style={{fontFamily:"Inter,sans-serif",fontSize:"0.75rem",color:T.textDim,lineHeight:1.6}}>I respond to every serious inquiry — recruiters, researchers, professors, and fellow builders all welcome.</div>
            </div>
          </div>
        </div>
      </div>
    </Sec>
  );
};

// ─── FOOTER ───────────────────────────────────────────────────────────────────
const Footer=({T,onCmd})=>(
  <footer style={{position:"relative",zIndex:1,textAlign:"center",padding:"2rem 1.5rem",borderTop:`1px solid ${T.border}`}}>
    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.6rem",color:T.textDim}}>
      <span style={{color:T.green}}>rafi@sec-portfolio</span>:~$ echo "Curiosity is the best 0-day."
    </div>
    <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.55rem",color:T.textDim,marginTop:"0.5rem",opacity:0.55}}>
      © 2025 Rafi &nbsp;·&nbsp; Indonesia 🇮🇩 → Taiwan 🇹🇼 → Germany 🇩🇪
    </div>
    <button onClick={onCmd} style={{marginTop:"1rem",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.52rem",letterSpacing:"0.12em",color:T.textDim,background:"transparent",border:`1px solid ${T.border}`,padding:"0.28rem 0.7rem",borderRadius:"3px",cursor:"pointer",opacity:0.6,transition:"opacity 0.15s"}}
      onMouseEnter={e=>e.currentTarget.style.opacity="1"}
      onMouseLeave={e=>e.currentTarget.style.opacity="0.6"}>
      ⌘K — command palette
    </button>
  </footer>
);

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function Portfolio(){
  const[active,setActive]=useState("INIT");
  const[dark,setDark]=useState(true);
  const[cmdOpen,setCmdOpen]=useState(false);
  const T=dark?DARK:LIGHT;

  const onNav=useCallback(id=>{
    setActive(id);
    document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
  },[]);

  // Keyboard shortcuts
  useEffect(()=>{
    const fn=e=>{
      if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();setCmdOpen(o=>!o);}
      if(e.key==="/"&&e.target.tagName!=="INPUT"&&e.target.tagName!=="TEXTAREA"){e.preventDefault();setCmdOpen(true);}
    };
    window.addEventListener("keydown",fn);return()=>window.removeEventListener("keydown",fn);
  },[]);

  useEffect(()=>{
    const els=NAV_IDS.map(id=>document.getElementById(id)).filter(Boolean);
    const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)setActive(e.target.id);}),{threshold:0.22});
    els.forEach(el=>obs.observe(el));return()=>obs.disconnect();
  },[]);

  return(
    <div style={{background:T.bg,minHeight:"100vh",color:T.text,overflowX:"hidden",transition:"background 0.4s,color 0.3s"}}>
      <BG T={T}/>
      <CursorSpotlight dark={dark}/>
      <ScrollBar T={T}/>
      <Navbar active={active} onNav={onNav} dark={dark} toggleDark={()=>setDark(d=>!d)} T={T} onCmd={()=>setCmdOpen(true)}/>
      <CommandPalette open={cmdOpen} onClose={()=>setCmdOpen(false)} onNav={onNav} T={T}/>
      <Hero onNav={onNav} T={T}/>
      <About T={T}/>
      <Arsenal T={T}/>
      <Labs T={T}/>
      <Intel T={T}/>
      <Contact T={T}/>
      <Footer T={T} onCmd={()=>setCmdOpen(true)}/>

      <style>{`
        *{box-sizing:border-box;}body{margin:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(0,200,255,0.2);border-radius:2px;}
        button:focus-visible,a:focus-visible{outline:2px solid #00F0FF;outline-offset:2px;}
        ::selection{background:rgba(0,240,255,0.2);color:#fff;}

        @media(max-width:680px){
          section{padding-left:1rem!important;padding-right:1rem!important;padding-top:5rem!important;}
          .about-grid,.contact-grid{grid-template-columns:1fr!important;gap:2rem!important;}
          .stat-grid{grid-template-columns:1fr 1fr!important;}
          #ARSENAL>div>div{grid-template-columns:1fr!important;}
          #LABS>div:nth-child(3){grid-template-columns:1fr!important;}
          .wu-date,.wu-read{display:none!important;}
          .wu-row{grid-template-columns:62px 1fr!important;}
        }
        @media(max-width:900px) and (min-width:681px){
          .about-grid,.contact-grid{grid-template-columns:1fr!important;gap:2.5rem!important;}
        }
        @media(prefers-reduced-motion:reduce){
          *{animation:none!important;transition:none!important;}
        }
      `}</style>
    </div>
  );
}

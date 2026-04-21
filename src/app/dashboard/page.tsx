"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import NeuralCanvas from "@/components/NeuralCanvas";
import Cursor from "@/components/Cursor";

/* ─────────────────────────── types ─────────────────────────── */
type SensorType = "temperature"|"vibration"|"humidity"|"light"|"pressure"|"current"|"rpm"|"custom";
type ChartType = "line"|"bar"|"gauge";
type WidgetSize = "small"|"medium"|"large"|"wide";
interface Sensor { id:string; type:SensorType; chartType:ChartType; size:WidgetSize; warn:number; crit:number; label?:string; unit?:string; key?:string; }
interface Machine { name:string; desc?:string; color:string; url?:string; machineKey?:string; sensors:Sensor[]; }
interface Machines { [id:string]: Machine }

const SENSOR_DEFS: Record<SensorType,{label:string;unit:string;key:string;color:string;warn:number;crit:number;min:number;max:number}> = {
  temperature:{ label:"Temperature",unit:"°C",   key:"temperature",color:"#00d4e8",warn:70, crit:85, min:0,   max:120  },
  vibration:  { label:"Vibration",  unit:"mm/s", key:"vibration",  color:"#f5a623",warn:8,  crit:12, min:0,   max:20   },
  humidity:   { label:"Humidity",   unit:"%RH",  key:"humidity",   color:"#6c9fff",warn:75, crit:90, min:0,   max:100  },
  light:      { label:"Light",      unit:"lux",  key:"ldr",        color:"#a78bfa",warn:800,crit:1000,min:0,  max:1500 },
  pressure:   { label:"Pressure",   unit:"bar",  key:"pressure",   color:"#ff6b35",warn:8,  crit:12, min:0,   max:16   },
  current:    { label:"Current",    unit:"A",    key:"current",    color:"#ff4d6a",warn:15, crit:20, min:0,   max:30   },
  rpm:        { label:"RPM",        unit:"rpm",  key:"rpm",        color:"#2dd4aa",warn:3000,crit:4000,min:0, max:5000 },
  custom:     { label:"Custom",     unit:"",     key:"custom",     color:"#9bb8d4",warn:80, crit:95, min:0,   max:100  },
};
const COLORS=["#00d4e8","#6c9fff","#2dd4aa","#f5a623","#ff4d6a","#a78bfa","#ff6b35","#00f0ff"];
function genId(prefix="id"){ return prefix+"_"+Math.random().toString(36).slice(2,8); }

/* ─── Sparkline SVG (no lib needed) ─────────── */
function Sparkline({ vals, color, height=52 }: { vals:number[]; color:string; height?:number }) {
  if(vals.length < 2) return <div style={{height}} />;
  const min=Math.min(...vals), max=Math.max(...vals), range=max-min||1;
  const pts = vals.map((v,i)=>`${(i/(vals.length-1))*100},${100-((v-min)/range)*100}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{width:"100%",height,display:"block"}}>
      <defs><linearGradient id={`g${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polygon points={`0,100 ${pts} 100,100`} fill={`url(#g${color.replace("#","")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const LogoIcon = () => (
  <svg viewBox="0 0 24 24" style={{width:18,height:18,fill:"none",stroke:"rgba(2,6,16,.9)",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"}}>
    <circle cx="12" cy="12" r="3"/><line x1="12" y1="9" x2="12" y2="3"/><line x1="14.6" y1="9.7" x2="19" y2="6"/>
    <line x1="14.6" y1="14.3" x2="19" y2="18"/><line x1="12" y1="15" x2="12" y2="21"/><line x1="9.4" y1="14.3" x2="5" y2="18"/><line x1="9.4" y1="9.7" x2="5" y2="6"/>
  </svg>
);

export default function DashboardPage() {
  /* ── State ── */
  const [machines, setMachines] = useState<Machines>({});
  const [activeMachineId, setActiveMachineId] = useState<string|null>(null);
  const [editMode, setEditMode] = useState(false);
  const [runMode, setRunMode] = useState<"idle"|"live"|"demo">("idle");
  const [sessionPts, setSessionPts] = useState(0);
  const [connStatus, setConnStatus] = useState<{ok:boolean;label:string}>({ok:false,label:"Disconnected"});
  const [gwUrl, setGwUrl] = useState("");
  const [pollRate, setPollRate] = useState(2000);
  const [toast, setToast] = useState<{msg:string;type:"ok"|"err"|"warn";show:boolean}>({msg:"",type:"ok",show:false});
  const [clock, setClock] = useState("");
  const [uptime, setUptime] = useState("--");
  const [sensorData, setSensorData] = useState<Record<string,{vals:number[];min:number;max:number}>>({});
  /* modals */
  const [machModal, setMachModal] = useState(false);
  const [sensorModal, setSensorModal] = useState(false);
  const [editingMachId, setEditingMachId] = useState<string|null>(null);
  const [editingSensorId, setEditingSensorId] = useState<string|null>(null);
  /* modal form */
  const [mName,setMName]=useState(""); const [mDesc,setMDesc]=useState("");
  const [mKey,setMKey]=useState(""); const [mUrl,setMUrl]=useState(""); const [mColor,setMColor]=useState(COLORS[0]);
  const [sType,setSType]=useState<SensorType>("temperature"); const [sChart,setSChart]=useState<ChartType>("line");
  const [sSize,setSSize]=useState<WidgetSize>("small"); const [sWarn,setSWarn]=useState(70); const [sCrit,setSCrit]=useState(85);
  const [sCustomName,setSCustomName]=useState(""); const [sCustomUnit,setSCustomUnit]=useState(""); const [sCustomKey,setSCustomKey]=useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const startTime = useRef<number|null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const demoRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const demoPhase = useRef(0);

  /* ── Load from storage ── */
  useEffect(()=>{
    try{const s=localStorage.getItem("rs_machines"); if(s){ const m=JSON.parse(s); setMachines(m); const ids=Object.keys(m); if(ids.length) setActiveMachineId(ids[0]); }}catch(e){}
  },[]);
  function persist(m:Machines){ try{localStorage.setItem("rs_machines",JSON.stringify(m));}catch(e){} }

  /* ── Clock ── */
  useEffect(()=>{
    const id=setInterval(()=>{
      setClock(new Date().toLocaleTimeString("en-GB"));
      if(startTime.current){
        const s=Math.floor((Date.now()-startTime.current)/1000);
        setUptime(`${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`);
      }
    },1000);
    return ()=>clearInterval(id);
  },[]);

  /* ── Toast ── */
  const toastRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  function showToast(msg:string,type:"ok"|"err"|"warn"="ok"){
    setToast({msg,type,show:true});
    if(toastRef.current) clearTimeout(toastRef.current);
    toastRef.current=setTimeout(()=>setToast(t=>({...t,show:false})),3000);
  }

  /* ── Process data ── */
  const processData = useCallback((payload:Record<string,unknown>, machId:string, mach:Machine)=>{
    const updates:Record<string,{vals:number[];min:number;max:number}>={};
    mach.sensors.forEach(s=>{
      const def=SENSOR_DEFS[s.type];
      const fieldKey=s.key||def.key;
      const v=parseFloat(String(payload[fieldKey]??payload[s.type]??payload[def.key]??""));
      if(isNaN(v)) return;
      setSensorData(prev=>{
        const sd=prev[s.id]||{vals:[],min:Infinity,max:-Infinity};
        const vals=[...sd.vals,v].slice(-60);
        return {...prev,[s.id]:{vals,min:Math.min(sd.min,v),max:Math.max(sd.max,v)}};
      });
    });
    setSessionPts(p=>p+1);
  },[]);

  /* ── Demo mode ── */
  function runDemo(machId:string, mach:Machine){
    demoPhase.current+=0.09;
    const p=demoPhase.current;
    const payload:Record<string,number>={
      temperature:55+Math.sin(p*.7)*20+(Math.random()-.5)*4,
      vibration:4+Math.sin(p*1.3)*5+(Math.random()-.5)*1,
      humidity:60+Math.sin(p*.5)*18+(Math.random()-.5)*3,
      ldr:400+Math.sin(p*.4)*300+(Math.random()-.5)*25,
      pressure:6+Math.sin(p*.6)*3+(Math.random()-.5)*.5,
      current:10+Math.sin(p*.8)*6+(Math.random()-.5)*1,
      rpm:2500+Math.sin(p*.3)*800+(Math.random()-.5)*50,
      custom:50+Math.sin(p)*30+(Math.random()-.5)*5,
    };
    processData(payload,machId,mach);
    demoRef.current=setTimeout(()=>runDemo(machId,mach),pollRate);
  }

  function startDemo(){
    stopAll();
    if(!activeMachineId||!machines[activeMachineId]){showToast("Add a machine first","err");return;}
    setRunMode("demo"); startTime.current=Date.now();
    setConnStatus({ok:true,label:"Demo"});
    showToast("Demo mode — simulating live sensor data","warn");
    demoRef.current=setTimeout(()=>runDemo(activeMachineId,machines[activeMachineId]),100);
  }

  /* ── Live polling ── */
  async function pollLoop(url:string, machId:string, mach:Machine){
    if(runMode!=="live"&&startTime.current===null) return;
    try{
      const resp=await fetch(url,{signal:AbortSignal.timeout(5000)});
      if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data=await resp.json();
      const readings=Array.isArray(data)?data:[data];
      readings.forEach((r:Record<string,unknown>)=>processData(r,machId,mach));
      setConnStatus({ok:true,label:"Connected"});
    }catch(e:unknown){ setConnStatus({ok:false,label:(e as Error).message||"Error"}); }
    pollRef.current=setTimeout(()=>pollLoop(url,machId,mach),pollRate);
  }

  function connectGateway(){
    if(!gwUrl.trim()){showToast("Enter a gateway URL","err");return;}
    if(!activeMachineId||!machines[activeMachineId]){showToast("Add a machine first","err");return;}
    stopAll(); setRunMode("live"); startTime.current=Date.now();
    setConnStatus({ok:true,label:"Connecting…"});
    pollRef.current=setTimeout(()=>pollLoop(gwUrl,activeMachineId,machines[activeMachineId]),100);
  }

  function stopAll(){
    if(pollRef.current) clearTimeout(pollRef.current);
    if(demoRef.current) clearTimeout(demoRef.current);
    setRunMode("idle"); setConnStatus({ok:false,label:"Disconnected"});
    startTime.current=null; setUptime("--");
  }

  /* ── Machine CRUD ── */
  function openAddMach(id:string|null=null){
    setEditingMachId(id);
    if(id&&machines[id]){ const m=machines[id]; setMName(m.name); setMDesc(m.desc||""); setMKey(m.machineKey||id); setMUrl(m.url||""); setMColor(m.color); }
    else{ setMName(""); setMDesc(""); setMKey(""); setMUrl(""); setMColor(COLORS[0]); }
    setMachModal(true);
  }
  function saveMach(){
    if(!mName.trim()){showToast("Machine name required","err");return;}
    const id=editingMachId||genId("mach");
    const upd:Machines={...machines,[id]:{...(machines[id]||{sensors:[]}),name:mName,desc:mDesc,color:mColor,url:mUrl,machineKey:mKey||id}};
    setMachines(upd); persist(upd); setActiveMachineId(id); setMachModal(false);
    showToast(`Machine "${mName}" saved`,"ok");
  }
  function deleteMach(){
    if(!editingMachId)return;
    if(!confirm(`Delete "${machines[editingMachId]?.name}"?`))return;
    const upd={...machines}; delete upd[editingMachId];
    setMachines(upd); persist(upd);
    const ids=Object.keys(upd); setActiveMachineId(ids[0]||null);
    setMachModal(false); showToast("Machine deleted","warn");
  }

  /* ── Sensor CRUD ── */
  function openAddSensor(sid:string|null=null){
    setEditingSensorId(sid);
    if(sid&&activeMachineId){
      const s=machines[activeMachineId].sensors.find(x=>x.id===sid);
      if(s){ setSType(s.type); setSChart(s.chartType); setSSize(s.size); setSWarn(s.warn); setSCrit(s.crit); setSCustomName(s.label||""); setSCustomUnit(s.unit||""); setSCustomKey(s.key||""); }
    } else {
      setSType("temperature"); setSChart("line"); setSSize("small"); setSWarn(70); setSCrit(85); setSCustomName(""); setSCustomUnit(""); setSCustomKey("");
    }
    setSensorModal(true);
  }
  function saveSensor(){
    if(!activeMachineId)return;
    const id=editingSensorId||genId("sensor");
    const sensor:Sensor={id,type:sType,chartType:sChart,size:sSize,warn:sWarn,crit:sCrit,...(sType==="custom"?{label:sCustomName,unit:sCustomUnit,key:sCustomKey}:{})};
    const upd={...machines};
    if(editingSensorId){ upd[activeMachineId].sensors=upd[activeMachineId].sensors.map(s=>s.id===editingSensorId?sensor:s); }
    else { upd[activeMachineId].sensors=[...(upd[activeMachineId].sensors||[]),sensor]; }
    setMachines(upd); persist(upd); setSensorModal(false);
    showToast(`Sensor ${editingSensorId?"updated":"added"}`,"ok");
  }
  function removeSensor(sid:string){
    if(!activeMachineId||!confirm("Remove this sensor?"))return;
    const upd={...machines}; upd[activeMachineId].sensors=upd[activeMachineId].sensors.filter(s=>s.id!==sid);
    setMachines(upd); persist(upd); showToast("Sensor removed","warn");
  }
  function setWidgetSize(sid:string, size:WidgetSize){
    if(!activeMachineId)return;
    const upd={...machines}; upd[activeMachineId].sensors=upd[activeMachineId].sensors.map(s=>s.id===sid?{...s,size}:s);
    setMachines(upd); persist(upd);
  }

  /* ── Export CSV ── */
  function exportCSV(){
    if(!activeMachineId){showToast("No machine selected","err");return;}
    const m=machines[activeMachineId]; const rows=["timestamp,machine,sensor_type,value,unit"];
    m.sensors.forEach(s=>{ const def=SENSOR_DEFS[s.type]; const sd=sensorData[s.id]; if(!sd)return; sd.vals.forEach((v,i)=>rows.push(`${i}s,${m.name},${s.type},${v.toFixed(3)},${s.unit||def.unit}`)); });
    if(rows.length<2){showToast("No data to export yet","warn");return;}
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([rows.join("\n")],{type:"text/csv"}));
    a.download=`${m.name.replace(/\s+/g,"_")}.csv`; a.click(); showToast("CSV exported","ok");
  }

  /* ── Active machine ── */
  const activeMach = activeMachineId?machines[activeMachineId]:null;
  const sensors = activeMach?.sensors||[];

  /* ── Health score ── */
  let health=100;
  sensors.forEach(s=>{ const sd=sensorData[s.id]; if(!sd||!sd.vals.length)return; const v=sd.vals[sd.vals.length-1]; if(v>=s.crit) health-=25; else if(v>=s.warn) health-=10; });
  health=Math.max(0,health);
  const healthColor=health>70?"var(--neural)":health>40?"var(--amber)":"var(--red)";

  /* ── Render sensor widget ── */
  function SensorWidget({s}:{s:Sensor}){
    const def=SENSOR_DEFS[s.type]||SENSOR_DEFS.custom;
    const color=def.color;
    const sd=sensorData[s.id];
    const v=sd?.vals[sd.vals.length-1];
    const vFmt=v!==undefined?v.toFixed(1):"--";
    const status=v===undefined?"ok":v>=s.crit?"crit":v>=s.warn?"warn":"ok";
    const badgeColors={ok:"var(--green)",warn:"var(--amber)",crit:"var(--red)"};
    const badgeBgs={ok:"rgba(45,212,170,.08)",warn:"rgba(245,166,35,.08)",crit:"rgba(255,77,106,.08)"};
    const borderColor=status==="crit"?"var(--red)":status==="warn"?"var(--amber)":"var(--border)";
    const colSpan=s.size==="medium"?2:s.size==="large"?3:s.size==="wide"?"1 / -1":"auto";

    return (
      <div style={{ background:"var(--card)", border:`1px solid ${borderColor}`, borderRadius:12, overflow:"hidden", position:"relative", transition:"border-color .3s", gridColumn:colSpan }}>
        <div style={{height:2,background:`linear-gradient(90deg,${color},transparent)`}} />
        <div style={{padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
            <div style={{fontFamily:"var(--font-mono)",fontSize:9,color:"var(--t3)",letterSpacing:1.5,textTransform:"uppercase"}}>{s.label||def.label}</div>
            <div style={{fontFamily:"var(--font-mono)",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:4,letterSpacing:.5,background:badgeBgs[status],color:badgeColors[status],border:`1px solid ${badgeColors[status]}40`}}>{status.toUpperCase()}</div>
          </div>
          <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:6}}>
            <span style={{fontFamily:"var(--font-mono)",fontSize:30,fontWeight:600,lineHeight:1,color}}>{vFmt}</span>
            <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--t3)"}}>{s.unit||def.unit}</span>
          </div>
          <Sparkline vals={sd?.vals||[]} color={color} height={s.size==="small"?52:72} />
          <div style={{display:"flex",justifyContent:"space-between",fontFamily:"var(--font-mono)",fontSize:9,color:"var(--t3)",marginTop:4}}>
            <span>MIN <span style={{color:"var(--t2)",fontWeight:600}}>{sd?.min===Infinity?"--":(sd?.min||0).toFixed(1)}</span></span>
            <span>MAX <span style={{color:"var(--t2)",fontWeight:600}}>{sd?.max===-Infinity?"--":(sd?.max||0).toFixed(1)}</span></span>
          </div>
          <div style={{display:"flex",gap:12,marginTop:5,fontFamily:"var(--font-mono)",fontSize:9,color:"var(--t3)"}}>
            <span>WARN <span style={{color:"var(--t2)"}}>{s.warn}</span></span>
            <span>CRIT <span style={{color:"var(--t2)"}}>{s.crit}</span></span>
          </div>
        </div>
        {/* Edit overlay */}
        {editMode&&(
          <div style={{position:"absolute",inset:0,background:"rgba(2,6,16,.82)",backdropFilter:"blur(4px)",zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
            <div style={{display:"flex",gap:5,alignItems:"center"}}>
              {(["small","medium","large","wide"] as WidgetSize[]).map(sz=>(
                <button key={sz} onClick={()=>setWidgetSize(s.id,sz)} style={{padding:"4px 9px",borderRadius:4,border:`1px solid ${s.size===sz?"var(--neural)":"var(--border2)"}`,fontFamily:"var(--font-mono)",fontSize:9,color:s.size===sz?"var(--neural)":"var(--t2)",background:s.size===sz?"rgba(0,212,232,.08)":"transparent",cursor:"pointer"}}>
                  {sz==="small"?"S":sz==="medium"?"M":sz==="large"?"L":"↔"}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>openAddSensor(s.id)} style={{padding:"6px 14px",borderRadius:6,border:"1px solid var(--pulse)",color:"var(--pulse)",background:"rgba(108,159,255,.08)",fontFamily:"var(--font-mono)",fontSize:10,cursor:"pointer",fontWeight:600}}>Configure</button>
              <button onClick={()=>removeSensor(s.id)} style={{padding:"6px 14px",borderRadius:6,border:"1px solid var(--red)",color:"var(--red)",background:"rgba(255,77,106,.06)",fontFamily:"var(--font-mono)",fontSize:10,cursor:"pointer",fontWeight:600}}>Remove</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Modal backdrop ── */
  function Modal({show,onClose,children}:{show:boolean;onClose:()=>void;children:React.ReactNode}){
    if(!show) return null;
    return (
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(2,6,16,.8)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:"var(--bg2)",border:"1px solid var(--border2)",borderRadius:16,padding:28,width:500,maxWidth:"95vw",maxHeight:"88vh",overflowY:"auto",position:"relative"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,borderRadius:"16px 16px 0 0",background:"linear-gradient(90deg,var(--neural),var(--pulse))"}} />
          {children}
        </div>
      </div>
    );
  }

  const inp=(style?:React.CSSProperties) => ({...{width:"100%",padding:"8px 12px",background:"var(--card)",border:"1px solid var(--border2)",borderRadius:7,color:"var(--t1)",fontFamily:"var(--font-mono)",fontSize:12,outline:"none"},...style});
  const modalH = {fontFamily:"var(--font-display)",fontSize:22,fontWeight:700,letterSpacing:1,color:"var(--t1)",marginBottom:20,paddingBottom:14,borderBottom:"1px solid var(--border)"};
  const formLbl = {fontFamily:"var(--font-mono)",fontSize:9,color:"var(--t3)",letterSpacing:1,marginBottom:6,display:"block" as const,textTransform:"uppercase" as const};
  const mBtn=(variant:"primary"|"secondary"|"danger")=>({padding:"8px 20px",borderRadius:7,border:`1px solid ${variant==="primary"?"var(--neural)":variant==="danger"?"var(--red)":"var(--border2)"}`,fontFamily:"var(--font-display)",fontSize:15,fontWeight:700,color:variant==="primary"?"var(--neural)":variant==="danger"?"var(--red)":"var(--t2)",background:variant==="primary"?"rgba(0,212,232,.06)":variant==="danger"?"rgba(255,77,106,.06)":"transparent",cursor:"pointer"});

  return (
    <>
      <Cursor />
      <NeuralCanvas opacity={0.2} />
      <div style={{display:"flex",flexDirection:"column",height:"100vh",position:"relative",zIndex:1}}>

        {/* ── HEADER ── */}
        <header style={{flexShrink:0,display:"flex",alignItems:"center",padding:"0 24px",height:60,background:"rgba(2,6,16,.92)",borderBottom:"1px solid var(--border)",backdropFilter:"blur(24px)",gap:16,zIndex:100,position:"relative"}}>
          <Link href="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none",flexShrink:0}}>
            <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,var(--neural),var(--pulse))",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 30% 30%,rgba(255,255,255,.2),transparent 60%)"}} />
              <LogoIcon />
            </div>
            <div>
              <div style={{fontFamily:"var(--font-display)",fontSize:20,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"var(--t1)"}}>Reflex<span style={{color:"var(--neural)"}}>Sense</span></div>
              <div style={{fontFamily:"var(--font-mono)",fontSize:9,color:"var(--t3)",letterSpacing:1.5}}>NERVEDASH · v2.1</div>
            </div>
          </Link>

          <div style={{width:1,height:28,background:"var(--border)",flexShrink:0}} />

          {/* Machine buttons */}
          <div style={{display:"flex",alignItems:"center",gap:6,flex:1,overflowX:"auto",scrollbarWidth:"none"}}>
            {Object.entries(machines).map(([id,m])=>(
              <button key={id} onClick={()=>setActiveMachineId(id)} onDoubleClick={()=>openAddMach(id)} title="Click to view · Double-click to edit"
                style={{display:"flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:20,border:`1px solid ${id===activeMachineId?"var(--neural)":"var(--border2)"}`,background:id===activeMachineId?"rgba(0,212,232,.06)":"transparent",color:id===activeMachineId?"var(--neural)":"var(--t2)",fontFamily:"var(--font-body)",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:m.color,flexShrink:0}} />
                {m.name}
              </button>
            ))}
            <button onClick={()=>openAddMach()} style={{padding:"5px 12px",borderRadius:20,border:"1px dashed var(--border2)",background:"transparent",color:"var(--t3)",fontFamily:"var(--font-mono)",fontSize:10,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--neural)";e.currentTarget.style.color="var(--neural)"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border2)";e.currentTarget.style.color="var(--t3)"}}>
              + Add Machine
            </button>
          </div>

          {/* Header right */}
          <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(0,212,232,.05)",border:`1px solid rgba(0,212,232,${runMode!=="idle"?.2:.05})`,color:"var(--neural)",fontFamily:"var(--font-mono)",fontSize:10,fontWeight:600,letterSpacing:1.5,padding:"3px 10px",borderRadius:20,opacity:runMode!=="idle"?1:.3}}>
              <div style={{width:6,height:6,background:"var(--neural)",borderRadius:"50%",animation:"blink 1.2s infinite"}} />LIVE
            </div>
            <div style={{fontFamily:"var(--font-mono)",textAlign:"right"}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{clock||"--:--:--"}</div>
            </div>
            <button onClick={()=>{setEditMode(!editMode)}} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:7,border:`1px solid ${editMode?"var(--amber)":"var(--border2)"}`,background:editMode?"rgba(245,166,35,.06)":"transparent",color:editMode?"var(--amber)":"var(--t2)",fontFamily:"var(--font-mono)",fontSize:10,fontWeight:600,letterSpacing:.5,cursor:"pointer"}}>
              Edit
            </button>
            <button onClick={exportCSV} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:7,border:"1px solid var(--border2)",background:"transparent",color:"var(--t2)",fontFamily:"var(--font-mono)",fontSize:10,fontWeight:600,letterSpacing:.5,cursor:"pointer"}}>
              CSV
            </button>
          </div>
        </header>

        {/* ── EDIT BANNER ── */}
        {editMode&&(
          <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:12,padding:"7px 24px",background:"rgba(245,166,35,.05)",borderBottom:"1px solid rgba(245,166,35,.2)",fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:.5,color:"var(--amber)"}}>
            ✏ Edit Mode — click widget overlays to configure or resize each sensor widget
            <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
              <button onClick={()=>{showToast("Layout saved","ok");}} style={{padding:"4px 12px",borderRadius:5,border:"1px solid var(--neural)",color:"var(--neural)",background:"rgba(0,212,232,.06)",fontFamily:"var(--font-mono)",fontSize:10,cursor:"pointer",fontWeight:600}}>Save Layout</button>
              <button onClick={()=>setEditMode(false)} style={{padding:"4px 12px",borderRadius:5,border:"1px solid var(--border2)",color:"var(--t2)",background:"transparent",fontFamily:"var(--font-mono)",fontSize:10,cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        )}

        {/* ── CONNECTION BAR ── */}
        <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:8,padding:"8px 20px",background:"rgba(5,13,30,.6)",borderBottom:"1px solid var(--border)",flexWrap:"wrap",backdropFilter:"blur(12px)"}}>
          <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"white",letterSpacing:.5,whiteSpace:"nowrap"}}>Gateway URL</span>
          <input value={gwUrl} onChange={e=>setGwUrl(e.target.value)} placeholder="https://your-ngrok-url.ngrok.io/data" style={{background:"var(--bg2)",border:"1px solid var(--border2)",color:"var(--t1)",borderRadius:6,padding:"5px 11px",fontFamily:"var(--font-mono)",fontSize:11,outline:"none",width:290}} />
          <button onClick={connectGateway} style={{padding:"5px 13px",borderRadius:6,border:"1px solid var(--neural)",color:"var(--neural)",background:"rgba(0,212,232,.06)",fontFamily:"var(--font-mono)",fontSize:10,fontWeight:600,cursor:"pointer"}}>Connect</button>
          <button onClick={startDemo} style={{padding:"5px 13px",borderRadius:6,border:"1px solid var(--pulse)",color:"var(--pulse)",background:"rgba(108,159,255,.05)",fontFamily:"var(--font-mono)",fontSize:10,fontWeight:600,cursor:"pointer"}}>Demo Mode</button>
          {runMode!=="idle"&&<button onClick={stopAll} style={{padding:"5px 13px",borderRadius:6,border:"1px solid var(--red)",color:"var(--red)",background:"rgba(255,77,106,.06)",fontFamily:"var(--font-mono)",fontSize:10,fontWeight:600,cursor:"pointer"}}>Stop</button>}
          <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"white",marginLeft:4}}>Poll</span>
          <select value={pollRate} onChange={e=>setPollRate(Number(e.target.value))} style={{background:"var(--bg2)",border:"1px solid var(--border2)",color:"var(--t2)",borderRadius:6,padding:"5px 8px",fontFamily:"var(--font-mono)",fontSize:10,outline:"none",cursor:"pointer"}}>
            <option value={2000}>2s</option><option value={5000}>5s</option><option value={10000}>10s</option><option value={30000}>30s</option>
          </select>
          <div style={{display:"flex",alignItems:"center",gap:5,fontFamily:"var(--font-mono)",fontSize:10,color:"var(--t3)"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:connStatus.ok?"var(--neural)":"var(--red)"}} />
            <span>{connStatus.label}</span>
          </div>
        </div>

        {/* ── WORKSPACE ── */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:14}}>
          {!activeMach ? (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,gap:16,color:"var(--t3)",textAlign:"center",padding:"60px 20px"}}>
              <svg viewBox="0 0 24 24" style={{width:48,height:48,stroke:"var(--t3)",fill:"none",strokeWidth:1.2}}><circle cx="12" cy="12" r="3"/><line x1="12" y1="9" x2="12" y2="3"/><line x1="14.6" y1="9.7" x2="19" y2="6"/><line x1="14.6" y1="14.3" x2="19" y2="18"/><line x1="12" y1="15" x2="12" y2="21"/><line x1="9.4" y1="14.3" x2="5" y2="18"/><line x1="9.4" y1="9.7" x2="5" y2="6"/></svg>
              <h2 style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:700,letterSpacing:1,color:"var(--t2)"}}>No Machines Configured</h2>
              <p style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--t3)",maxWidth:280}}>Add a machine to start monitoring your sensor network</p>
              <button onClick={()=>openAddMach()} style={{padding:"10px 28px",borderRadius:8,border:"none",background:"linear-gradient(135deg,var(--neural),var(--pulse))",color:"var(--void)",fontFamily:"var(--font-display)",fontSize:16,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer"}}>+ Add First Machine</button>
            </div>
          ) : (
            <>
              {/* Machine header card */}
              <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,flexWrap:"wrap"}}>
                <div style={{width:11,height:11,borderRadius:"50%",background:activeMach.color,flexShrink:0}} />
                <div style={{flex:1}}>
                  <h2 style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:700,letterSpacing:1,color:"var(--t1)"}}>{activeMach.name}</h2>
                  <p style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--t3)",letterSpacing:.3,marginTop:2}}>{activeMach.desc||"No description"} · ID: {activeMach.machineKey||activeMachineId}</p>
                </div>
                <div style={{display:"flex",gap:20,fontFamily:"var(--font-mono)",fontSize:10,color:"var(--t3)"}}>
                  <div>Sensors <span style={{color:"var(--t2)",fontWeight:600}}>{sensors.length}</span></div>
                  <div>Status <span style={{color:healthColor,fontWeight:600}}>{health>70?"Healthy":health>40?"Monitor":"Critical"}</span></div>
                  <div>Health <span style={{color:healthColor,fontWeight:600}}>{health}%</span></div>
                </div>
                <button onClick={()=>openAddMach(activeMachineId||undefined)} style={{padding:"6px 14px",borderRadius:7,border:"1px solid var(--border2)",background:"transparent",color:"var(--t2)",fontFamily:"var(--font-mono)",fontSize:10,cursor:"pointer",fontWeight:600}}>Edit Machine</button>
              </div>

              {/* Sensor grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
                {sensors.map(s=><SensorWidget key={s.id} s={s} />)}
                {editMode&&(
                  <div onClick={()=>openAddSensor()} style={{background:"transparent",border:"1px dashed var(--border2)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:24,cursor:"pointer",color:"var(--t3)",fontFamily:"var(--font-mono)",fontSize:11,transition:"all .2s",minHeight:120}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--neural)";e.currentTarget.style.color="var(--neural)"}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border2)";e.currentTarget.style.color="var(--t3)"}}>
                    + Add Sensor Widget
                  </div>
                )}
                {!editMode&&sensors.length===0&&(
                  <div style={{gridColumn:"1/-1",textAlign:"center",padding:40,color:"var(--t3)",fontFamily:"var(--font-mono)",fontSize:11}}>
                    Click <strong style={{color:"var(--amber)"}}>Edit</strong> in the header to add sensor widgets
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={{flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 20px",background:"rgba(2,6,16,.9)",borderTop:"1px solid var(--border)",fontFamily:"var(--font-mono)",fontSize:10,color:"var(--t3)"}}>
          <div style={{display:"flex",gap:18}}>
            <div>Uptime <span style={{color:"var(--t2)"}}>{uptime}</span></div>
            <div>Records <span style={{color:"var(--t2)"}}>{sessionPts}</span></div>
            <div>Mode <span style={{color:"var(--t2)"}}>{runMode==="demo"?"Demo":runMode==="live"?"Live":"Idle"}</span></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontFamily:"var(--font-display)",fontSize:13,fontWeight:700,letterSpacing:2,color:"var(--t3)"}}>Reflex<em style={{color:"var(--neural)",fontStyle:"normal"}}>Sense</em></span>
            <span style={{color:"var(--t3)"}}>RP2040 · MicroPython · FastAPI</span>
          </div>
        </div>
      </div>

      {/* ── MACHINE MODAL ── */}
      <Modal show={machModal} onClose={()=>setMachModal(false)}>
        <h3 style={modalH}>{editingMachId?"Edit Machine":"Add Machine"}</h3>
        <div style={{marginBottom:14}}><label style={formLbl}>Machine Name</label><input value={mName} onChange={e=>setMName(e.target.value)} placeholder="e.g. Motor A" style={inp()} /></div>
        <div style={{marginBottom:14}}><label style={formLbl}>Description</label><input value={mDesc} onChange={e=>setMDesc(e.target.value)} placeholder="e.g. Main production line motor" style={inp()} /></div>
        <div style={{marginBottom:14}}><label style={formLbl}>Machine ID (for API routing)</label><input value={mKey} onChange={e=>setMKey(e.target.value)} placeholder="e.g. machine_a" style={inp()} /></div>
        <div style={{marginBottom:14}}><label style={formLbl}>Gateway URL (optional)</label><input value={mUrl} onChange={e=>setMUrl(e.target.value)} placeholder="https://ngrok-url.ngrok.io/data" style={inp()} /></div>
        <div style={{marginBottom:20}}><label style={formLbl}>Color</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {COLORS.map(c=><div key={c} onClick={()=>setMColor(c)} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:`3px solid ${mColor===c?"var(--t1)":"transparent"}`,transition:"border-color .2s"}} />)}
          </div>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:20,paddingTop:16,borderTop:"1px solid var(--border)"}}>
          {editingMachId&&<button onClick={deleteMach} style={{...mBtn("danger"),marginRight:"auto"}}>Delete</button>}
          <button onClick={()=>setMachModal(false)} style={mBtn("secondary")}>Cancel</button>
          <button onClick={saveMach} style={mBtn("primary")}>Save Machine</button>
        </div>
      </Modal>

      {/* ── SENSOR MODAL ── */}
      <Modal show={sensorModal} onClose={()=>setSensorModal(false)}>
        <h3 style={modalH}>{editingSensorId?"Configure Sensor":"Add Sensor Widget"}</h3>
        <div style={{marginBottom:14}}>
          <label style={formLbl}>Sensor Type</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
            {(Object.keys(SENSOR_DEFS) as SensorType[]).map(t=>(
              <div key={t} onClick={()=>{setSType(t);setSWarn(SENSOR_DEFS[t].warn);setSCrit(SENSOR_DEFS[t].crit);}} style={{padding:"8px 6px",border:`1px solid ${sType===t?"var(--neural)":"var(--border2)"}`,borderRadius:8,cursor:"pointer",textAlign:"center",fontFamily:"var(--font-mono)",fontSize:10,color:sType===t?"var(--neural)":"var(--t2)",background:sType===t?"rgba(0,212,232,.06)":"transparent",transition:"all .2s"}}>
                <span style={{display:"block",fontSize:16,marginBottom:3}}>
                  {t==="temperature"?"🌡":t==="vibration"?"〰":t==="humidity"?"💧":t==="light"?"💡":t==="pressure"?"🔽":t==="current"?"⚡":t==="rpm"?"⚙":"✦"}
                </span>{t.charAt(0).toUpperCase()+t.slice(1)}
              </div>
            ))}
          </div>
        </div>
        {sType==="custom"&&(
          <div style={{marginBottom:14,padding:14,background:"var(--card)",borderRadius:8,border:"1px solid var(--border)"}}>
            <label style={formLbl}>Custom Name</label><input value={sCustomName} onChange={e=>setSCustomName(e.target.value)} placeholder="e.g. Oil Pressure" style={{...inp(),marginBottom:8}} />
            <label style={formLbl}>Unit</label><input value={sCustomUnit} onChange={e=>setSCustomUnit(e.target.value)} placeholder="e.g. bar" style={{...inp(),marginBottom:8}} />
            <label style={formLbl}>API Field Key</label><input value={sCustomKey} onChange={e=>setSCustomKey(e.target.value)} placeholder="e.g. oil_pressure" style={inp()} />
          </div>
        )}
        <div style={{marginBottom:14}}>
          <label style={formLbl}>Chart Type</label>
          <div style={{display:"flex",gap:6}}>
            {(["line","bar","gauge"] as ChartType[]).map(ct=>(
              <div key={ct} onClick={()=>setSChart(ct)} style={{padding:"6px 14px",border:`1px solid ${sChart===ct?"var(--pulse)":"var(--border2)"}`,borderRadius:6,cursor:"pointer",fontFamily:"var(--font-mono)",fontSize:10,color:sChart===ct?"var(--pulse)":"var(--t2)",background:sChart===ct?"rgba(108,159,255,.06)":"transparent"}}>{ct.charAt(0).toUpperCase()+ct.slice(1)}</div>
            ))}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={formLbl}>Widget Size</label>
          <div style={{display:"flex",gap:6}}>
            {(["small","medium","large","wide"] as WidgetSize[]).map(sz=>(
              <div key={sz} onClick={()=>setSSize(sz)} style={{padding:"6px 14px",border:`1px solid ${sSize===sz?"var(--pulse)":"var(--border2)"}`,borderRadius:6,cursor:"pointer",fontFamily:"var(--font-mono)",fontSize:10,color:sSize===sz?"var(--pulse)":"var(--t2)",background:sSize===sz?"rgba(108,159,255,.06)":"transparent"}}>{sz.charAt(0).toUpperCase()+sz.slice(1)}</div>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div><label style={formLbl}>Warn Threshold</label><input type="number" value={sWarn} onChange={e=>setSWarn(Number(e.target.value))} style={inp()} /></div>
          <div><label style={formLbl}>Critical Threshold</label><input type="number" value={sCrit} onChange={e=>setSCrit(Number(e.target.value))} style={inp()} /></div>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:20,paddingTop:16,borderTop:"1px solid var(--border)"}}>
          <button onClick={()=>setSensorModal(false)} style={mBtn("secondary")}>Cancel</button>
          <button onClick={saveSensor} style={mBtn("primary")}>Save Sensor</button>
        </div>
      </Modal>

      {/* ── TOAST ── */}
      <div className={`toast ${toast.type} ${toast.show?"show":""}`}>{toast.msg}</div>
    </>
  );
}

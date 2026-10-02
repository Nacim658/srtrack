
document.documentElement.classList.add("js");
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const sstep=t=>{t=clamp(t);return t*t*(3-2*t);};
function kf(s,keys){
if(s<=keys[0][0])return keys[0][1];
for(let i=1;i<keys.length;i++){if(s<=keys[i][0]){const a=keys[i-1],b=keys[i];return lerp(a[1],b[1],sstep((s-a[0])/(b[0]-a[0])));}}
return keys[keys.length-1][1];
}
/* =====================  SCROLL / INTERFACE  ===================== */
const stages=$$(`[data-stage]`);
const visualExplode=document.getElementById("visualExplode");
const visualInstall=document.getElementById("visualInstall");
const visualControl=document.getElementById("visualControl");
const LABELS=["Roulage","Vue éclatée","Installation","Contrôle","Plateforme"];
const hudNum=$("#hudNum"),hudLabel=$("#hudLabel"),hudBar=$("#hudBar");
let sT=0;
function computeStage(){
const vh=innerHeight;let s=0;
for(let i=0;i<stages.length;i++){
const r=stages[i].getBoundingClientRect();
if(r.top<=0){const span=i===stages.length-1?vh*3:r.height;s=i+clamp(-r.top/span);}
}
return s;
}
function updateUI(){
sT=computeStage();
const i=Math.min(stages.length-1,Math.floor(sT+1e-6)),f=clamp(sT-i);
hudNum.textContent=String(i+1).padStart(2,"0")+" / "+String(stages.length).padStart(2,"0");
hudLabel.textContent=LABELS[i]||"";
hudBar.style.width=(clamp(sT/stages.length)*100)+"%";
stages.forEach((st,k)=>{
const items=$$("[data-item]",st);if(!items.length)return;
const a=k<i?items.length:(k>i?-1:Math.min(items.length-1,Math.floor(f*items.length)));
items.forEach((it,j)=>{it.classList.toggle("active",k===i&&j===a);it.classList.toggle("done",j<a);});
});
}
let ticking=false;
addEventListener("scroll",()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>{updateUI();ticking=false;});}},{passive:true});
addEventListener("resize",updateUI);
updateUI();
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.12});
$$(".reveal").forEach(el=>io.observe(el));
/* =====================  CHARGEMENT THREE.JS  ===================== */
const CDN=["https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","https://unpkg.com/three@0.170.0/build/three.module.js"];
let THREE=null;
for(const u of CDN){try{THREE=await import(u);break;}catch(e){console.warn("three.js indisponible sur",u,e);}}
if(!THREE){document.body.classList.add("no3d");throw new Error("three.js n'a pas pu être chargé");}
const canvas=$("#bg3d");
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});}
catch(e){document.body.classList.add("no3d");throw e;}
const mobile=matchMedia("(max-width:800px)").matches;
renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:2));
renderer.shadowMap.enabled=!mobile;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0x2a5a56,38,135);
const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,400);
/* ---------- ciel + environnement (reflets) ---------- */
function skyTexture(){
const c=document.createElement("canvas");c.width=16;c.height=512;
const g=c.getContext("2d"),gr=g.createLinearGradient(0,0,0,512);
gr.addColorStop(0,"#050f1a");gr.addColorStop(.55,"#12394a");gr.addColorStop(.86,"#2f6a62");gr.addColorStop(1,"#e0a45e");
g.fillStyle=gr;g.fillRect(0,0,16,512);
const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
scene.background=skyTexture();
{
const pm=new THREE.PMREMGenerator(renderer),env=new THREE.Scene();
env.add(new THREE.Mesh(new THREE.SphereGeometry(10,32,16),new THREE.MeshBasicMaterial({map:skyTexture(),side:THREE.BackSide})));
const soft=new THREE.MeshBasicMaterial({color:0xffffff});
[[0,8,0,8,.3,8],[-9,3,2,.3,5,8],[9,2,-3,.3,4,9]].forEach(a=>{const m=new THREE.Mesh(new THREE.BoxGeometry(a[3],a[4],a[5]),soft);m.position.set(a[0],a[1],a[2]);env.add(m);});
scene.environment=pm.fromScene(env,.04).texture;
if("environmentIntensity" in scene)scene.environmentIntensity=.85;
}
/* ---------- lumières ---------- */
scene.add(new THREE.HemisphereLight(0xbfe3ff,0x2a3a2a,1.0));
const sun=new THREE.DirectionalLight(0xffd9a8,3.2);
sun.position.set(-12,18,14);sun.castShadow=!mobile;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-24,right:24,top:16,bottom:-16,near:1,far:70});
sun.shadow.bias=-.0004;
scene.add(sun);
const rim=new THREE.DirectionalLight(0x6fb7ff,1.1);rim.position.set(14,8,-10);scene.add(rim);
const holoLight=new THREE.PointLight(0x19d48a,0,40);holoLight.position.set(0,7,4);scene.add(holoLight);
/* ---------- matériaux & helpers ---------- */
const M=(c,m=.2,r=.5,x={})=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r,...x});
const paint=new THREE.MeshPhysicalMaterial({color:0xf3f5f4,metalness:.1,roughness:.32,clearcoat:.7,clearcoatRoughness:.2});
const chrome=M(0xd5dcdf,1,.16),steel=M(0x2a3033,.7,.45),dark=M(0x14181a,.5,.5),rubber=M(0x0e0f10,0,.92),glass=M(0x35566b,.9,.08),orange=new THREE.MeshBasicMaterial({color:0xff9a1f});
const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
function mesh(geo,mat,x=0,y=0,z=0,shadow=true){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;return m;}
/* ---------- sol, route, étoiles ---------- */
const ground=new THREE.Mesh(new THREE.PlaneGeometry(500,500),M(0x1a281c,0,1));
ground.rotation.x=-Math.PI/2;ground.position.y=-.03;ground.receiveShadow=true;scene.add(ground);
const road=mesh(B(500,.1,9.4),M(0x23282b,0,.9),0,-.05,0,false);scene.add(road);
for(const z of[-4.3,4.3])scene.add(mesh(B(500,.02,.16),new THREE.MeshBasicMaterial({color:0xffffff}),0,.01,z,false));
const NDASH=62,dashes=new THREE.InstancedMesh(B(3,.02,.15),new THREE.MeshBasicMaterial({color:0xffffff}),NDASH);
scene.add(dashes);
const dummy=new THREE.Object3D();
{
const N=420,pos=new Float32Array(N*3);
for(let i=0;i<N;i++){const a=Math.random()*Math.PI*2,r=170+Math.random()*20,y=25+Math.random()*120;pos[i*3]=Math.cos(a)*r;pos[i*3+1]=y;pos[i*3+2]=Math.sin(a)*r-30;}
const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos,3));
scene.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:.9,sizeAttenuation:true,fog:false,transparent:true,opacity:.8})));
}
/* arbres d'automne (comme sur la photo) */
const NT=84,PT=504;
const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.18,.28,2,6).translate(0,1,0),M(0x4a3524,0,.9),NT);
const canopies=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),M(0xffffff,0,.85),NT);
const pal=[0xd9531e,0xe8862a,0xf2b134,0xb83a1a,0x7a9a2a,0xe36a1c].map(c=>new THREE.Color(c));
const trees=[];
for(let i=0;i<NT;i++){const side=i%2?1:-1;trees.push({x:(i>>1)*12+Math.random()*6,z:side*(8+Math.random()*13),s:.8+Math.random()*.9});canopies.setColorAt(i,pal[i%pal.length]);}
scene.add(trunks,canopies);
/* ---------- CAMION RÉEL — PHOTO + VUE ÉCLATÉE 2.5D ---------- */
const ASSET={
  full:"assets/full.jpg",
  truck:"assets/truck_master.png",
  cab:"assets/truck_cab_real.webp",
  trailer:"assets/truck_trailer_real.webp",
  chassis:"assets/truck_chassis_real.webp",
  cabInterior:"assets/cab_interior.jpg"
};
const loader=new THREE.TextureLoader();
const cache=new Map();
function tex(src){
  if(cache.has(src))return cache.get(src);
  const t=loader.load(src,undefined,undefined,e=>console.warn("Image introuvable:",src,e));
  t.colorSpace=THREE.SRGBColorSpace;
  t.anisotropy=4;
  cache.set(src,t);
  return t;
}
function photoPlane(src,w,h,opacity=1){
  const mat=new THREE.MeshBasicMaterial({map:tex(src),transparent:true,opacity,side:THREE.DoubleSide,depthWrite:false,fog:false,toneMapped:false});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);
  m.renderOrder=20;
  return m;
}
/* La photo fournie devient le vrai hero visuel, sans camion LEGO. */
const photoBg=new THREE.Sprite(new THREE.SpriteMaterial({map:tex(ASSET.full),transparent:true,opacity:1,depthWrite:false,depthTest:false,fog:false,toneMapped:false}));
photoBg.position.set(0,6.2,-24);
photoBg.scale.set(42,22.94,1);
photoBg.renderOrder=-50;
scene.add(photoBg);

const truck=new THREE.Group();
truck.position.set(0.9,0.1,1.2);
scene.add(truck);
const parts=[];
function part(g,off,rot=0){
  g.userData.off=new THREE.Vector3(...off);
  g.userData.home=g.position.clone();
  g.userData.rot=rot;
  truck.add(g);parts.push(g);return g;
}

/* image complète du camion pendant la transition avant l'explosion */
const wholeTruck=photoPlane(ASSET.truck,10.6,9.28,0);
wholeTruck.position.set(0,3.65,0.3);
wholeTruck.userData.baseScale=1;
truck.add(wholeTruck);

/* pièces photo réelles : cabine, remorque et châssis */
const cabPart=photoPlane(ASSET.cab,5.35,6.42,0);cabPart.position.set(2.55,3.45,0.9);part(cabPart,[2.5,2.0,1.1],-.16);
const trailerPart=photoPlane(ASSET.trailer,4.25,6.9,0);trailerPart.position.set(-2.35,3.25,0.25);part(trailerPart,[-2.8,2.0,-1.0],.11);
const chassisPart=photoPlane(ASSET.chassis,8.75,3.24,0);chassisPart.position.set(-.55,.95,0.45);part(chassisPart,[0,-2.9,0.0],-.02);

/* cutaway intérieur cabine : volume transparent + éléments 3D + extrait photo réel */
const interior=new THREE.Group();
interior.position.set(2.15,3.55,1.0);interior.visible=false;truck.add(interior);
const interiorShell=new THREE.Mesh(new THREE.BoxGeometry(3.35,2.55,2.35),new THREE.MeshBasicMaterial({color:0x9cead0,transparent:true,opacity:.10,wireframe:true,depthWrite:false,fog:false}));
interior.add(interiorShell);
const floor=mesh(B(3.1,.12,2.1),M(0x202729,.4,.65),0,-1.18,0,false);interior.add(floor);
const dash=mesh(B(2.55,.36,1.05),M(0x1a2224,.55,.42),0,.08,.78);interior.add(dash);
const seatL=mesh(B(.6,1.15,.72),M(0x2b3134,.2,.6),-.72,-.25,.25);interior.add(seatL);
const seatR=seatL.clone();seatR.position.x=.72;interior.add(seatR);
const wheel=new THREE.Mesh(new THREE.TorusGeometry(.38,.07,14,36),chrome);wheel.rotation.x=Math.PI/2;wheel.position.set(.6,.02,1.0);interior.add(wheel);
const wheelHub=mesh(new THREE.CylinderGeometry(.10,.10,.12,16),dark,.6,.02,1.0);wheelHub.rotation.x=Math.PI/2;interior.add(wheelHub);
const interiorPhoto=photoPlane(ASSET.cabInterior,2.55,1.43,.95);interiorPhoto.position.set(-.15,.52,1.13);interior.add(interiorPhoto);
const gpsInCab=mesh(B(.42,.11,.30),M(0x101816,.7,.3,{emissive:0x062a1d}),-.2,.92,.87);interior.add(gpsInCab);
const gpsLed=new THREE.Mesh(new THREE.SphereGeometry(.055,12,12),new THREE.MeshBasicMaterial({color:0x19d48a}));gpsLed.position.set(0,.98,1.03);interior.add(gpsLed);

/* balises GPS — les cibles restent attachées aux vraies pièces photo */
function mountOn(parentIdx,x,y,z){const o=new THREE.Object3D();o.position.set(x,y,z);parts[parentIdx].add(o);return o;}
const idxCab=parts.indexOf(cabPart),idxChassis=parts.indexOf(chassisPart),idxTrailer=parts.indexOf(trailerPart);
const mounts=[
  mountOn(idxCab,-.20,.55,.18),          // cabine / tableau de bord
  mountOn(idxChassis,1.10,.10,.20),      // dessous châssis
  mountOn(idxTrailer,.95,.95,.22),       // remorque avant
  mountOn(idxTrailer,-1.15,1.0,-.22)      // remorque arrière
];
const TH=[.1,.35,.6,.85];
const beacons=mounts.map(()=>{const b=makeBeacon();b.scale.setScalar(0);b.visible=false;scene.add(b);return b;});

/* étiquettes GPS */
function makeLabel(text){
  const c=document.createElement('canvas');c.width=420;c.height=84;const g=c.getContext('2d');
  g.fillStyle='rgba(4,17,12,.88)';rr(g,4,4,412,76,16);g.fill();
  g.strokeStyle='#19d48a';g.lineWidth=3;g.stroke();
  g.fillStyle='#19d48a';g.font='800 22px Arial';g.textBaseline='middle';g.fillText(text,22,42);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,fog:false}));sp.scale.set(2.5,.5,1);sp.visible=false;scene.add(sp);return sp;
}
const gpsLabels=["GPS 01 · CABINE","GPS 02 · CHÂSSIS","GPS 03 · REMORQUE","GPS 04 · REMORQUE"] .map(makeLabel);

function setOpacityGroup(root,o){
  root.traverse(x=>{
    if(!x.material)return;
    const mats=Array.isArray(x.material)?x.material:[x.material];
    mats.forEach(m=>{if(x.userData.baseOpacity==null)x.userData.baseOpacity=m.opacity==null?1:m.opacity;m.transparent=true;m.opacity=x.userData.baseOpacity*o;});
  });
}
/* ---------- TECHNICIENS ---------- */
const DOWN=new THREE.Vector3(0,-1,0),_v=new THREE.Vector3(),_d=new THREE.Vector3();
function makePerson(o){
const P=new THREE.Group();
const skin=M(o.skin,0,.7),pants=M(0x1e2b3a,0,.85),shirt=M(0x33443d,0,.85),vestM=M(0xff7a00,0,.6,{emissive:0x2a1000,side:THREE.DoubleSide}),refl=M(0xeef3ef,.5,.35,{emissive:0x333333,side:THREE.DoubleSide}),boot=M(0x15110e,0,.7),glove=M(0x24282a,0,.8),helm=M(o.helmet,.1,.35);
const hips=new THREE.Group();hips.position.y=.92;P.add(hips);
const pelvis=mesh(new THREE.CylinderGeometry(.18,.17,.2,18),pants);pelvis.scale.z=.7;hips.add(pelvis);
const legs=[];
for(const sd of[-1,1]){
const th=new THREE.Group();th.position.set(sd*.09,-.04,0);hips.add(th);
th.add(mesh(new THREE.CapsuleGeometry(.075,.28,4,10),pants,0,-.23,0));
const kn=new THREE.Group();kn.position.y=-.46;th.add(kn);
kn.add(mesh(new THREE.CapsuleGeometry(.062,.3,4,10),pants,0,-.21,0));
kn.add(mesh(B(.12,.09,.27),boot,0,-.44,.06));
legs.push({th,kn});
}
const torso=new THREE.Group();torso.position.y=.06;hips.add(torso);
const chest=mesh(new THREE.CylinderGeometry(.2,.17,.56,20),shirt,0,.3,0);chest.scale.z=.62;torso.add(chest);
const vest=mesh(new THREE.CylinderGeometry(.212,.182,.5,20,1,true),vestM,0,.31,0);vest.scale.z=.66;torso.add(vest);
for(const y of[.2,.4]){const r=mesh(new THREE.CylinderGeometry(.208,.2,.035,20,1,true),refl,0,y,0,false);r.scale.z=.66;torso.add(r);}
torso.add(mesh(new THREE.CylinderGeometry(.05,.055,.1,12),skin,0,.64,0));
const head=new THREE.Group();head.position.y=.76;torso.add(head);
const hd=mesh(new THREE.SphereGeometry(.105,24,20),skin);hd.scale.set(.95,1.15,1);head.add(hd);
for(const sd of[-1,1])head.add(mesh(new THREE.SphereGeometry(.013,8,8),M(0x111111,0,.4),sd*.038,.015,.098,false));
head.add(mesh(new THREE.SphereGeometry(.02,10,10),skin,0,-.005,.105,false));
head.add(mesh(B(.07,.012,.01),M(0x7a3b30,0,.6),0,-.055,.098,false));
const hat=mesh(new THREE.SphereGeometry(.125,24,12,0,Math.PI*2,0,Math.PI/2),helm,0,.04,0);hat.scale.set(1,1,1.08);head.add(hat);
head.add(mesh(B(.22,.012,.11),helm,0,.045,.11,false));
const arms=[];
for(const sd of[-1,1]){
const sh=new THREE.Group();sh.position.set(sd*.25,.52,0);torso.add(sh);
sh.add(mesh(new THREE.SphereGeometry(.065,12,10),shirt));
sh.add(mesh(new THREE.CapsuleGeometry(.052,.24,4,10),shirt,0,-.19,0));
const el=new THREE.Group();el.position.y=-.36;sh.add(el);
el.add(mesh(new THREE.CapsuleGeometry(.047,.2,4,10),shirt,0,-.14,0));
el.add(mesh(new THREE.SphereGeometry(.056,12,10),glove,0,-.31,0));
const hand=new THREE.Object3D();hand.position.y=-.33;el.add(hand);
arms.push({sh,el,hand,pos:sh.position.clone()});
}
P.scale.setScalar(.93);P.visible=false;scene.add(P);
P.userData={hips,torso,legs,arms};
return P;
}
const TECH=[
{skin:0xd8a47c,helmet:0xffffff,st:[4.8,5.4],bs:[0],cr:0},
{skin:0x7c4f33,helmet:0xffc400,st:[2.4,5.2],bs:[1],cr:.85},
{skin:0xf0c9a6,helmet:0xffffff,st:[-4.8,5.6],bs:[2,3],cr:0},
{skin:0xb9825d,helmet:0x19d48a,st:[8.6,4.4],sup:true,cr:0}
].map(o=>({...o,P:makePerson(o),reach:0,cr2:0,ph:0,prev:new THREE.Vector3(o.st[0],0,o.st[1]+16),yaw:Math.PI}));
/* tablette du superviseur */
const tabC=document.createElement("canvas");tabC.width=256;tabC.height=160;const tabG=tabC.getContext("2d");
const tabTex=new THREE.CanvasTexture(tabC);tabTex.colorSpace=THREE.SRGBColorSpace;
{
const sup=TECH[3].P.userData.arms[1].hand;
const tab=new THREE.Group();tab.position.set(0,-.02,.07);tab.rotation.x=-1.15;
tab.add(mesh(B(.3,.2,.015),M(0x101315,.5,.4)));
const scr=new THREE.Mesh(new THREE.PlaneGeometry(.27,.17),new THREE.MeshBasicMaterial({map:tabTex,toneMapped:false}));scr.position.z=.009;tab.add(scr);
sup.add(tab);
}
function drawTablet(ip){
const g=tabG;g.fillStyle="#06201a";g.fillRect(0,0,256,160);
g.fillStyle="#19d48a";g.font="700 18px Arial";g.fillText("INSTALLATION GPS",14,28);
g.fillStyle="#9fb8ab";g.font="14px Arial";const n=Math.min(4,Math.floor(ip*4.2));g.fillText("Balises posées : "+n+" / 4",14,56);
g.fillStyle="rgba(255,255,255,.12)";g.fillRect(14,70,228,10);g.fillStyle="#19d48a";g.fillRect(14,70,228*clamp(ip),10);
for(let i=0;i<4;i++){g.fillStyle=i<n?"#19d48a":"rgba(255,255,255,.18)";g.beginPath();g.arc(30+i*54,112,12,0,7);g.fill();}
g.fillStyle="#9fb8ab";g.font="12px Arial";g.fillText(ip>.97?"Tests OK — mise en service":"Configuration en cours…",14,148);
tabTex.needsUpdate=true;
}
function aimArm(P,arm,target,reach,sway,bendBase){
let dir=_d.set(0,-1,sway);
if(target&&reach>.01){
_v.copy(target);P.userData.torso.worldToLocal(_v).sub(arm.pos).normalize();
dir=_d.set(0,-1,sway).multiplyScalar(1-reach).addScaledVector(_v,reach);
}
arm.sh.quaternion.setFromUnitVectors(DOWN,dir.normalize());
arm.el.rotation.x=-(bendBase+.7*reach);
}
const vm=new THREE.Vector3(),vh=new THREE.Vector3(),vt=new THREE.Vector3();
/* cônes de chantier */
const cones=new THREE.Group();
for(let i=0;i<7;i++){
const c=new THREE.Group();
c.add(mesh(new THREE.ConeGeometry(.2,.62,16),M(0xff6a00,0,.6),0,.31,0));
c.add(mesh(new THREE.CylinderGeometry(.14,.16,.1,16),M(0xffffff,0,.6),0,.28,0,false));
c.add(mesh(B(.46,.04,.46),M(0x222222,0,.8),0,.02,0));
c.position.set(-12+i*4,0,7.2);cones.add(c);
}
cones.visible=false;scene.add(cones);
/* ---------- HOLOGRAMME DE CONTRÔLE ---------- */
const dc=document.createElement("canvas");dc.width=800;dc.height=460;const dg=dc.getContext("2d");
const dTex=new THREE.CanvasTexture(dc);dTex.colorSpace=THREE.SRGBColorSpace;
const mapC=document.createElement("canvas");mapC.width=516;mapC.height=340;
(function(){
const g=mapC.getContext("2d");g.fillStyle="#0c3a36";g.fillRect(0,0,516,340);
g.fillStyle="#145a45";[[40,40,90,60],[330,200,110,80],[200,10,80,50],[420,260,70,60]].forEach(r=>g.fillRect(...r));
let seed=7;const rnd=()=>(seed=seed*16807%2147483647)/2147483647;
g.strokeStyle="rgba(160,230,210,.25)";g.lineWidth=2;
for(let i=0;i<26;i++){g.beginPath();g.moveTo(rnd()*516,rnd()*340);g.lineTo(rnd()*516,rnd()*340);g.stroke();}
g.lineWidth=6;g.strokeStyle="rgba(210,255,240,.2)";
for(let i=0;i<5;i++){g.beginPath();g.moveTo(0,rnd()*340);g.lineTo(516,rnd()*340);g.stroke();}
})();
const ROUTE=[[20,310],[90,250],[170,235],[230,170],[320,150],[400,80],[490,40]];
const RLEN=[];let RT=0;for(let i=1;i<ROUTE.length;i++){const l=Math.hypot(ROUTE[i][0]-ROUTE[i-1][0],ROUTE[i][1]-ROUTE[i-1][1]);RLEN.push(l);RT+=l;}
const VEH=[["CAM-01","Paris → Lyon",84],["CAM-02","Lille → Metz",77],["CAM-03","Nantes → Tours",0],["CAM-04","Orly → Rungis",46],["CAM-05","Lyon → Nice",88]];
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function drawDash(t){
const g=dg;g.clearRect(0,0,800,460);
rr(g,6,6,788,448,26);g.fillStyle="rgba(5,26,24,.86)";g.fill();g.lineWidth=3;g.strokeStyle="#19d48a";g.shadowColor="#19d48a";g.shadowBlur=18;g.stroke();g.shadowBlur=0;
g.fillStyle="rgba(255,255,255,.06)";g.fillRect(22,22,756,36);
g.fillStyle="#19d48a";g.font="700 16px Arial";g.textBaseline="middle";g.fillText("S.R.TRACK  ·  CONTRÔLE FLOTTE",34,40);
g.fillStyle="#9fb8ab";g.textAlign="right";g.fillText(new Date().toLocaleTimeString("fr-FR"),766,40);g.textAlign="left";
VEH.forEach((v,i)=>{
const y=72+i*60,sel=i===0;
rr(g,22,y,236,52,10);g.fillStyle=sel?"rgba(25,212,138,.2)":"rgba(255,255,255,.05)";g.fill();
const on=v[2]>0;g.fillStyle=on?"#19d48a":"#ffb020";g.beginPath();g.arc(42,y+26,6,0,7);g.fill();
g.fillStyle="#fff";g.font="700 15px Arial";g.fillText(v[0],58,y+18);
g.fillStyle="#9fb8ab";g.font="12px Arial";g.fillText(v[1],58,y+38);
g.textAlign="right";g.fillStyle="#fff";g.font="700 15px Arial";g.fillText(on?Math.round(v[2]+Math.sin(t*1.3+i)*4)+" km/h":"Arrêt",248,y+26);g.textAlign="left";
});
g.drawImage(mapC,270,72);
g.strokeStyle="rgba(25,212,138,.5)";g.lineWidth=2;g.strokeRect(270,72,516,340);
g.beginPath();ROUTE.forEach((p,i)=>i?g.lineTo(270+p[0],72+p[1]):g.moveTo(270+p[0],72+p[1]));
g.strokeStyle="#3fd7ff";g.lineWidth=5;g.shadowColor="#3fd7ff";g.shadowBlur=12;g.stroke();g.shadowBlur=0;
let d=((t*.07)%1)*RT,k=0;while(k<RLEN.length-1&&d>RLEN[k]){d-=RLEN[k];k++;}
const a=ROUTE[k],b=ROUTE[k+1],f=d/RLEN[k],mx=270+lerp(a[0],b[0],f),my=72+lerp(a[1],b[1],f);
g.fillStyle="rgba(25,212,138,.25)";g.beginPath();g.arc(mx,my,16+Math.sin(t*5)*3,0,7);g.fill();
g.fillStyle="#19d48a";g.beginPath();g.arc(mx,my,8,0,7);g.fill();g.fillStyle="#fff";g.beginPath();g.arc(mx,my,3,0,7);g.fill();
for(let i=0;i<4;i++){g.fillStyle="rgba(255,255,255,.08)";g.beginPath();g.arc(60+i*60,436,10,0,7);g.fill();}
g.fillStyle="#9fb8ab";g.font="12px Arial";g.fillText("ALERTES : 0   ·   BALISES : 4/4 EN LIGNE",560,436);
dTex.needsUpdate=true;
}
const panelMat=new THREE.MeshBasicMaterial({map:dTex,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,toneMapped:false,fog:false});
const panel=new THREE.Mesh(new THREE.PlaneGeometry(8.2,4.72),panelMat);panel.position.set(0,8.4,-1.5);panel.visible=false;scene.add(panel);
/* liaisons balises → hologramme + paquets de données */
const links=[],packets=[];
for(let i=0;i<4;i++){
const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);
const ln=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x19d48a,transparent:true,opacity:0,fog:false}));ln.frustumCulled=false;scene.add(ln);links.push(ln);
const pk=new THREE.Mesh(new THREE.SphereGeometry(.09,10,10),new THREE.MeshBasicMaterial({color:0xb9ffe0,fog:false}));pk.visible=false;scene.add(pk);packets.push(pk);
}
/* cage de scan + plan de balayage */
const wire=new THREE.LineSegments(new THREE.EdgesGeometry(B(15,5.4,2.9)),new THREE.LineBasicMaterial({color:0x3fd7ff,transparent:true,opacity:0,fog:false}));wire.position.set(0,2.9,0);scene.add(wire);
const scan=new THREE.Mesh(new THREE.PlaneGeometry(3.2,5.6),new THREE.MeshBasicMaterial({color:0x19d48a,transparent:true,opacity:0,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));scan.rotation.y=Math.PI/2;scan.position.y=2.9;scene.add(scan);
/* satellites */
const sats=[];
for(let i=0;i<2;i++){
const g=new THREE.Group();
g.add(mesh(B(.8,.5,.5),M(0xcfd6d9,.8,.3)));
for(const sd of[-1,1])g.add(mesh(B(1.3,.04,.6),M(0x1b4f9c,.6,.3,{emissive:0x07224a}),sd*1.1,0,0,false));
g.userData.a=i*Math.PI;scene.add(g);
const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:0x3fd7ff,transparent:true,opacity:0,fog:false}));ln.frustumCulled=false;scene.add(ln);
sats.push({g,ln});
}
/* ---------- CAMÉRA : positions clés selon le scroll ---------- */
const CAM=[
[0,1.8,5.8,14.5,.7,3.6,0],[.8,1.6,4.8,12.8,.3,3.3,0],[1.25,2.0,7.2,13.8,.1,3.6,0],[1.9,2.7,9.2,15.0,0,4.4,0],
[2.4,2.2,7.0,13.5,0,4.0,0],[3,3.0,5.5,13.0,0,3.8,0],[3.6,-4.0,5.8,14.5,0,3.8,0],[4.2,5.5,6.8,13.0,0,4.2,0],
[5,-4.6,4.9,13.5,1,3.8,0],[9,-4.6,4.9,13.5,1,3.8,0]
];
const camV=new THREE.Vector3(),camT=new THREE.Vector3();
function camAt(s){
for(let c=0;c<6;c++){}
const get=i=>kf(s,CAM.map(r=>[r[0],r[i]]));
camV.set(get(1),get(2),get(3));camT.set(get(4),get(5),get(6));
}
let mx=0,my=0;
addEventListener("pointermove",e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;},{passive:true});
function resize(){
const w=innerWidth,h=innerHeight;
renderer.setSize(w,h,false);
camera.aspect=w/h;
if(w>1050)camera.setViewOffset(w,h,-w*.16,0,w,h);else camera.clearViewOffset();
camera.updateProjectionMatrix();
}
addEventListener("resize",resize);resize();
/* ---------- BOUCLE ---------- */
let sS=sT,last=performance.now(),time=0,roadOff=0,dashT=0,tabT=0;
function frame(now){
requestAnimationFrame(frame);
if(document.hidden){last=now;return;}
const dt=Math.min(.05,(now-last)/1000);last=now;time+=dt;
sS+=(sT-sS)*(1-Math.exp(-dt*3.2));
const s=sS;
const dw=kf(s,[[0,1],[.55,1],[1,0],[3.75,0],[4.2,1],[9,1]]);
const e=kf(s,[[0,0],[.7,0],[1.25,1],[1.9,1],[2.35,.5],[2.8,0],[9,0]]);
const ip=kf(s,[[1.95,0],[2.95,1],[9,1]]);
const tw=kf(s,[[1.75,0],[2.15,1],[3.4,1],[3.85,0]]);
const c=kf(s,[[2.5,0],[3.15,1],[3.75,1],[4.3,.3],[9,.3]]);
// Visuels HTML synchronisés avec le scroll. Ils complètent la scène 3D avec les vraies photos.
if(visualExplode){visualExplode.style.opacity=String(e);visualExplode.style.transform=`translate3d(${(1-e)*70}px,-50%,0) rotateY(${(1-e)*-8}deg)`;}
if(visualInstall){visualInstall.style.opacity=String(tw);visualInstall.style.transform=`translate3d(${(1-tw)*90}px,${(1-tw)*20-50}px,0) rotateY(${(1-tw)*10}deg)`;}
if(visualControl){visualControl.style.opacity=String(c);visualControl.style.transform=`translate3d(${(1-c)*70}px,-50%,0) scale(${.92+.08*c})`;}
/* décor qui défile */
const v=12*dw;roadOff+=v*dt;
for(let i=0;i<NDASH;i++){dummy.position.set(((i*8-roadOff)%496+496)%496-248,.03,0);dummy.rotation.set(0,0,0);dummy.scale.setScalar(1);dummy.updateMatrix();dashes.setMatrixAt(i,dummy.matrix);}
dashes.instanceMatrix.needsUpdate=true;
for(let i=0;i<NT;i++){
const t=trees[i],x=((t.x-roadOff)%PT+PT)%PT-PT/2;
dummy.position.set(x,0,t.z);dummy.rotation.set(0,0,0);dummy.scale.setScalar(t.s);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
dummy.position.set(x,2.6*t.s,t.z);dummy.scale.set(1.7*t.s,1.55*t.s,1.7*t.s);dummy.updateMatrix();canopies.setMatrixAt(i,dummy.matrix);
}
trunks.instanceMatrix.needsUpdate=canopies.instanceMatrix.needsUpdate=true;
/* camion réel : roulage → apparation photo → vue éclatée */
const wholeA=kf(s,[[0,0],[.35,0],[.62,1],[1.05,1],[1.24,1],[1.62,0],[9,0]]);
photoBg.material.opacity=kf(s,[[0,1],[.75,1],[1.2,.16],[1.9,.11],[3.75,.08],[4.2,0],[9,0]]);
wholeTruck.material.opacity=wholeA*(1-.22*e);
wholeTruck.visible=wholeTruck.material.opacity>.01;
parts.forEach((p,i)=>{
  const bob=Math.sin(time*1.6+i)*.025*e;
  p.position.copy(p.userData.home).addScaledVector(p.userData.off,e);
  p.position.y+=bob;
  p.rotation.z=p.userData.rot*e;
  p.rotation.y=(i===0?.08:-.05)*e;
  p.scale.setScalar(.96+.10*e);
  p.material.opacity=e*.98;
  p.visible=e>.015;
});
/* l'intérieur se soulève hors de la cabine pour rendre le cutaway lisible */
const cutIn=sstep((e-.18)/.55);
interior.visible=cutIn>.01;
interior.position.set(2.15+1.65*e,3.55+2.05*e,1.05+1.0*e);
interior.rotation.y=.05*e;
setOpacityGroup(interior,cutIn);
/* camion photographique face caméra : effet 2.5D propre et stable */
truck.lookAt(camera.position.x,truck.position.y+3.2,camera.position.z);
truck.rotation.z=Math.sin(time*7)*.004*dw;
truck.position.y=.1+Math.sin(time*9)*.025*dw;
truck.updateMatrixWorld(true);
/* techniciens */
const installing=tw>.01;
cones.visible=installing;cones.scale.setScalar(Math.max(.001,tw));
TECH.forEach((T,ti)=>{
const P=T.P,U=P.userData;P.visible=installing;if(!installing)return;
const et=sstep(tw),tz=T.st[1]+(1-et)*18;
P.position.set(T.st[0],0,tz);
const mv=Math.hypot(P.position.x-T.prev.x,P.position.z-T.prev.z)/Math.max(dt,.001);
const vz=(P.position.z-T.prev.z)/Math.max(dt,.001);
T.prev.copy(P.position);
const focus=Math.PI;
const moving=mv>.4;
const wantYaw=moving?(vz>0?0:Math.PI):focus;
let dy=wantYaw-T.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));T.yaw+=dy*Math.min(1,dt*6);
P.rotation.y=T.yaw;
T.ph+=mv*dt*2.6;
const walk=clamp(mv/2.5);
let target=null,want=0;
if(T.bs){for(const bi of T.bs){if(ip>TH[bi]-.12&&ip<TH[bi]+.17){target=mounts[bi];want=1;}}}
T.reach+=(want-T.reach)*(1-Math.exp(-dt*7));
T.cr2+=((want&&T.cr?T.cr:T.cr*.25*et)-T.cr2)*(1-Math.exp(-dt*5));
const sw=Math.sin(T.ph)*.7*walk,cr=T.cr2;
U.legs[0].th.rotation.x=sw-cr*1.15;U.legs[1].th.rotation.x=-sw-cr*1.15;
U.legs[0].kn.rotation.x=Math.max(0,-Math.sin(T.ph))*.9*walk+cr*1.8;U.legs[1].kn.rotation.x=Math.max(0,Math.sin(T.ph))*.9*walk+cr*1.8;
U.hips.position.y=.92-cr*.42;U.torso.rotation.x=cr*.35;
P.updateMatrixWorld(true);
if(T.sup){
aimArm(P,U.arms[1],null,0,0,0);U.arms[1].sh.quaternion.setFromUnitVectors(DOWN,_d.set(-.12,-.45,.85).normalize());U.arms[1].el.rotation.x=-1.25;
aimArm(P,U.arms[0],null,0,0,.2);U.arms[0].sh.quaternion.setFromUnitVectors(DOWN,_d.set(.1,-.6,.7).normalize());U.arms[0].el.rotation.x=-1.0;
}else{
let tg=null;if(target){tg=target.getWorldPosition(vt);}
aimArm(P,U.arms[1],tg,T.reach,-Math.sin(T.ph)*.5*walk,.15);
aimArm(P,U.arms[0],tg,T.reach*.55,Math.sin(T.ph)*.5*walk,.15);
}
P.updateMatrixWorld(true);
});
/* balises GPS : animation depuis les mains des techniciens vers leur emplacement */
beacons.forEach((b,i)=>{
const appear=sstep((ip-(TH[i]-.12))/.05),fly=sstep((ip-TH[i])/.12);
b.visible=appear>.01;if(!b.visible){gpsLabels[i].visible=false;return;}
mounts[i].getWorldPosition(vm);
const owner=TECH.find(T=>T.bs&&T.bs.includes(i));
if(owner&&owner.P.visible){owner.P.userData.arms[1].hand.getWorldPosition(vh);vh.y+=.08;}
else{vh.copy(vm).add(new THREE.Vector3(0,2.4,0));}
b.position.lerpVectors(vh,vm,fly);b.position.y+=Math.sin(Math.PI*fly)*1.15;
b.scale.setScalar(appear*(1+.3*(1-fly)));
const placed=fly>=.999;
b.userData.halo.material.opacity=appear*(placed?.55+.35*Math.sin(time*4+i):.9);
b.userData.led.material.color.setHex(placed?0x19d48a:0xffd84a);
gpsLabels[i].visible=placed&&e>.15;
gpsLabels[i].position.set(b.position.x+(i%2?1.65:-1.65),b.position.y+.62,b.position.z+.05);
gpsLabels[i].material.opacity=clamp(e*(.65+.3*Math.sin(time*2+i)));
});
/* halo de diagnostic sur les emplacements GPS pendant la vue éclatée */
beacons.forEach((b,i)=>{if(b.visible){b.userData.halo.scale.setScalar((1.8+Math.sin(time*5+i)*.25)*(1+e*.5));}});
/* hologramme + liens + scan */
const showC=c>.02;
panel.visible=showC;panelMat.opacity=c;
holoLight.intensity=c*14;
if(showC){
dashT+=dt;if(dashT>.1){dashT=0;drawDash(time);}
panel.position.set(0,8.2+Math.sin(time*1.2)*.12,-1.5);
panel.lookAt(camera.position);
}
const hub=vt.set(0,panel.position.y-2.4,-1.5);
links.forEach((ln,i)=>{
const b=beacons[i];ln.material.opacity=showC&&b.visible?c*.7:0;
packets[i].visible=showC&&b.visible;
if(showC&&b.visible){
const p=ln.geometry.attributes.position;p.setXYZ(0,b.position.x,b.position.y+.2,b.position.z);p.setXYZ(1,hub.x,hub.y,hub.z);p.needsUpdate=true;
const k=(time*.6+i*.25)%1;packets[i].position.set(lerp(b.position.x,hub.x,k),lerp(b.position.y+.2,hub.y,k),lerp(b.position.z,hub.z,k));
}
});
wire.material.opacity=c*.55;scan.material.opacity=c*.22;scan.position.x=Math.sin(time*.9)*7.2;scan.visible=showC;
sats.forEach((S,i)=>{
const a=S.g.userData.a+time*.12;
S.g.position.set(Math.cos(a)*24,17+Math.sin(a*2)*2,Math.sin(a)*12-10);S.g.rotation.y=a;
S.ln.material.opacity=c*.4*(Math.sin(a)>-.2?1:0);
const p=S.ln.geometry.attributes.position;p.setXYZ(0,S.g.position.x,S.g.position.y,S.g.position.z);
if(beacons[0].visible)p.setXYZ(1,beacons[0].position.x,beacons[0].position.y,beacons[0].position.z);else p.setXYZ(1,0,5,0);
p.needsUpdate=true;
});
if(installing){tabT+=dt;if(tabT>.2){tabT=0;drawTablet(ip);}}
/* caméra */
camAt(s);
photoBg.position.set(camera.position.x*.08,6.2+camera.position.y*.04,-24);

const orb=Math.sin(time*.18)*.07;
camera.position.set(camV.x+Math.sin(orb)*camV.z*.35+mx*1.2,camV.y-my*.6,camV.z*Math.cos(orb));
camera.lookAt(camT);
renderer.render(scene,camera);
}
document.body.classList.add("ready");
console.info("S.R.TRACK : camion réel + photos locales + vue éclatée + intérieur + balises GPS + animations scroll.");
requestAnimationFrame(t=>{last=t;frame(t);});

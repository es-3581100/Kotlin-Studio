const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const load=async n=>(await fetch(`data/${n}.json`)).json();
const [nodes,edges,clusters,sources,bridges,routes,meta]=await Promise.all(['concepts','relations','clusters','sources','bridges','featured-routes','meta'].map(load));
const byId=new Map(nodes.map(n=>[n.id,n]));
const sourceById=new Map(sources.map(s=>[s.id,s]));
$('#meta').innerHTML=`${meta.concepts} concepts · ${meta.relations} relations<br>${meta.sources} local source capsules · SymPy build ${meta.sympyBuildVersion}`;

// Tabs
$$('#tabs button').forEach(b=>b.onclick=()=>{
  $$('#tabs button').forEach(x=>x.classList.toggle('active',x===b));
  $$('.tab').forEach(x=>x.classList.toggle('active',x.id===b.dataset.tab));
  if(b.dataset.tab==='map') requestAnimationFrame(resize);
  if(b.dataset.tab==='matrix') requestAnimationFrame(resizeMatrix);
});

// Atlas graph
const canvas=$('#graph'),ctx=canvas.getContext('2d');
let W=0,H=0,scale=.72,ox=0,oy=0,selected='sacred-computations',drag=false,last={x:0,y:0},activeCluster='all';
const clusterColors={root:'#22f2e6',ratios:'#e6c66d',sequences:'#59e4d4',number:'#63bce7',geometry:'#ef6f7d',transforms:'#9d86df',dynamics:'#e178a5',symbolic:'#8e78ff',code:'#74e7a7'};
function resize(){const r=canvas.getBoundingClientRect();canvas.width=Math.max(1,r.width*devicePixelRatio);canvas.height=Math.max(1,r.height*devicePixelRatio);W=r.width;H=r.height;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);draw();}
new ResizeObserver(resize).observe(canvas);
const screen=(x,y)=>({x:W/2+ox+x*scale,y:H/2+oy+y*scale});
function visible(n){return activeCluster==='all'||n.cluster===activeCluster||n.id===selected}
function draw(){
  ctx.clearRect(0,0,W,H);
  const sel=byId.get(selected),near=new Set();
  if(sel){for(const e of edges)if(e.source===selected)near.add(e.target);else if(e.target===selected)near.add(e.source)}
  for(const e of edges){
    const a=byId.get(e.source),b=byId.get(e.target);if(!a||!b||!visible(a)||!visible(b))continue;
    const A=screen(a.x,a.y),B=screen(b.x,b.y);const focus=e.source===selected||e.target===selected;
    const color=e.kind==='source-backed'?'#e6c66d':e.kind==='derived'?'#22f2e6':e.kind==='implementation'?'#9d86df':'#587274';
    ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.strokeStyle=color;ctx.globalAlpha=focus?.92:.18;ctx.lineWidth=focus?2.2:1;
    if(e.kind==='implementation')ctx.setLineDash([6,5]);else if(e.kind==='curated')ctx.setLineDash([2,5]);else ctx.setLineDash([]);ctx.stroke();
  }
  ctx.setLineDash([]);
  for(const n of nodes){
    if(!visible(n))continue;const p=screen(n.x,n.y),is=n.id===selected,dim=selected&&!is&&!near.has(n.id);
    ctx.globalAlpha=dim?.18:1;ctx.beginPath();ctx.arc(p.x,p.y,is?10:6,0,Math.PI*2);ctx.fillStyle=clusterColors[n.cluster]||'#9ac5c2';ctx.shadowBlur=is?18:7;ctx.shadowColor=ctx.fillStyle;ctx.fill();ctx.shadowBlur=0;
    if(is){ctx.strokeStyle='#d7fffc';ctx.lineWidth=2;ctx.stroke()}
    if(scale>.5||is){ctx.font=(is?'600 13px':'11px')+' system-ui';ctx.fillStyle='#d9f2ef';ctx.fillText(n.title,p.x+10,p.y+4)}
  }
  ctx.globalAlpha=1;
}
function hit(mx,my){let best=null,bd=18;for(const n of nodes){if(!visible(n))continue;const p=screen(n.x,n.y),d=Math.hypot(mx-p.x,my-p.y);if(d<bd){best=n;bd=d}}return best}
canvas.addEventListener('pointerdown',e=>{drag=true;last={x:e.offsetX,y:e.offsetY};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!drag)return;ox+=e.offsetX-last.x;oy+=e.offsetY-last.y;last={x:e.offsetX,y:e.offsetY};draw()});
canvas.addEventListener('pointerup',e=>{drag=false;const n=hit(e.offsetX,e.offsetY);if(n)selectNode(n.id)});
canvas.addEventListener('wheel',e=>{e.preventDefault();scale=Math.max(.2,Math.min(2.4,scale*Math.exp(-e.deltaY*.001)));draw()},{passive:false});
function selectNode(id){selected=id;renderInspector();draw();}
Object.entries({all:{label:'All'},...clusters}).forEach(([k,v])=>{const s=document.createElement('span');s.className='chip'+(k==='all'?' active':'');s.textContent=v.label;s.onclick=()=>{activeCluster=k;$$('#clusterFilters .chip').forEach(x=>x.classList.remove('active'));s.classList.add('active');draw()};$('#clusterFilters').append(s)});
function score(n,q){q=q.toLowerCase();const hay=[n.title,n.summary,n.formula,...n.aliases,...n.tags].join(' ').toLowerCase();if(n.title.toLowerCase().includes(q))return 10;if(hay.includes(q))return 5;let i=0;for(const c of hay)if(c===q[i])i++;return i===q.length?1:0}
function doSearch(){const q=$('#search').value.trim(),box=$('#searchResults');box.innerHTML='';if(!q)return;nodes.map(n=>[n,score(n,q)]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,16).forEach(([n])=>{const d=document.createElement('div');d.className='searchItem';d.innerHTML=`<strong>${n.title}</strong><span class="small">${n.formula||n.cluster}</span>`;d.onclick=()=>selectNode(n.id);box.append(d)})}
$('#search').oninput=doSearch;
function renderInspector(){
  const n=byId.get(selected),rel=edges.filter(e=>e.source===n.id||e.target===n.id),srcs=n.sources.map(id=>sourceById.get(id)).filter(Boolean);
  $('#inspector').innerHTML=`<div class="panelLabel">CONCEPT INSPECTOR</div><div class="eyebrow">${clusters[n.cluster]?.label||n.cluster}</div><div class="nodeTitle">${n.title}</div><p>${n.summary}</p>${n.formula?`<div class="formula">${n.formula}</div>`:''}<div>${n.tags.map(t=>`<span class="badge">${t}</span>`).join('')}</div>${n.bridgeAvailable?`<p><a href="#" id="openBridge">Open executable SymPy bridge →</a></p>`:''}<h3>Relations</h3>${rel.map(e=>{const other=byId.get(e.source===n.id?e.target:e.source);return `<div class="rel"><div><a href="#" data-node="${other.id}">${other.title}</a></div><strong>${e.relation}</strong><div class="kind">${e.kind}</div><div class="small">${e.why||''}</div></div>`}).join('')}<div class="sourceLinks"><h3>Source capsules</h3>${srcs.length?srcs.map(s=>`<a href="public/${s.localPath}" target="_blank">${s.title}</a>`).join(''):'<span class="muted">No direct capsule mapped; relation is derived/structural.</span>'}</div>`;
  $$('[data-node]').forEach(a=>a.onclick=e=>{e.preventDefault();selectNode(a.dataset.node)});
  const ob=$('#openBridge');if(ob)ob.onclick=e=>{e.preventDefault();openBridge(n.bridge);$$('#tabs button').find(x=>x.dataset.tab==='bridges').click()};
}
renderInspector();

// SymPy bridges
const bridgeNodeIds=nodes.filter(n=>n.bridgeAvailable).map(n=>n.id);
for(const id of bridgeNodeIds){const n=byId.get(id),d=document.createElement('div');d.className='bridgeItem';d.dataset.bridge=id;d.innerHTML=`<strong>${n.title}</strong><div class="small">${bridges[id].kind}</div>`;d.onclick=()=>openBridge(id);$('#bridgeList').append(d)}
function openBridge(id){
  if(!id||!bridges[id])return;$$('.bridgeItem').forEach(x=>x.classList.toggle('active',x.dataset.bridge===id));const n=byId.get(id),b=bridges[id];const codes=['sympy','python','c','javascript','rust'].filter(k=>b[k]);
  $('#bridgeDetail').innerHTML=`<div class="eyebrow">SYMBOLIC → EXECUTABLE</div><h2>${n?.title||id}</h2><p>${n?.summary||''}</p>${b.formula?`<div class="formula">${b.formula}</div>`:''}${b.polynomial?`<div class="formula">polynomial: ${b.polynomial}<br>exact root: ${b.exact}<br>≈ ${b.decimal}<br>residual: ${b.residual}</div>`:''}${b.companionMatrix?`<h3>State / companion matrix</h3><pre>${b.companionMatrix.map(r=>r.join('   ')).join('\n')}</pre>`:''}<div class="pipeline">${(b.pipeline||[]).map((x,i)=>`${i?'<i>→</i>':''}<span>${x}</span>`).join('')}</div><div class="codegrid">${codes.map(k=>`<div class="codecard"><h4>${k}</h4><pre>${escapeHtml(String(b[k]))}</pre></div>`).join('')}</div>`;
}
function escapeHtml(s){return s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
if(bridgeNodeIds[0])openBridge(bridgeNodeIds[0]);

// Matrix data model
const rows=nodes.filter(n=>n.id!=='sacred-computations');
const matrixCols=[
  ['Formula',n=>!!n.formula],
  ['Sources',n=>n.sources.length>0],
  ['SymPy bridge',n=>n.bridgeAvailable],
  ['Matrix lane',n=>edges.some(e=>(e.source===n.id||e.target===n.id)&&(e.source==='matrix-recurrence'||e.target==='matrix-recurrence'||e.source==='sympy-matrices'||e.target==='sympy-matrices'))],
  ['Code lane',n=>edges.some(e=>(e.source===n.id||e.target===n.id)&&(e.source==='codegen'||e.target==='codegen'||e.kind==='implementation'))]
];
const matrixFlags=new Map(rows.map(n=>[n.id,matrixCols.map(c=>c[1](n))]));
const clusterKeys=Object.keys(clusters);
const matrixCells=[];
rows.forEach((n,rowIndex)=>matrixCols.forEach((col,colIndex)=>matrixCells.push({node:n,rowIndex,colIndex,label:col[0],active:col[1](n)})));
const activeCellCount=matrixCells.filter(c=>c.active).length;
$('#matrixCellCount').textContent=activeCellCount;

// 3D matrix renderer: X=capability, Y=concept, Z=cluster
const mCanvas=$('#matrixCanvas'),mCtx=mCanvas.getContext('2d'),mStage=$('#matrixStage');
let MW=1,MH=1,mRx=-18*Math.PI/180,mRy=28*Math.PI/180,mRz=-2*Math.PI/180,mZoom=.95,mDrag=false,mDragMode='xy',mLast={x:0,y:0},mTravel=0,mHover=null,mFocus=rows.find(n=>n.id==='silver-ratio')?.id||rows[0]?.id,mCluster='all',mAuto=false,mRaf=0,mLastFrame=0;
const clusterDepth=new Map(clusterKeys.map((k,i)=>[k,(i-(clusterKeys.length-1)/2)*82]));
const clusterOrderWithin=new Map();
for(const k of clusterKeys){const ns=rows.filter(n=>n.cluster===k);ns.forEach((n,i)=>clusterOrderWithin.set(n.id,{i,count:ns.length}))}
function basePoint(cell){
  const pos=clusterOrderWithin.get(cell.node.id)||{i:cell.rowIndex,count:rows.length};
  const y=(pos.i-(pos.count-1)/2)*44;
  const x=(cell.colIndex-(matrixCols.length-1)/2)*150;
  const z=clusterDepth.get(cell.node.cluster)||0;
  return{x,y,z};
}
function rotatePoint(p){
  let{x,y,z}=p;
  let c=Math.cos(mRx),s=Math.sin(mRx);[y,z]=[y*c-z*s,y*s+z*c];
  c=Math.cos(mRy);s=Math.sin(mRy);[x,z]=[x*c+z*s,-x*s+z*c];
  c=Math.cos(mRz);s=Math.sin(mRz);[x,y]=[x*c-y*s,x*s+y*c];
  return{x,y,z};
}
function projectPoint(p){
  const r=rotatePoint(p),camera=1120,den=Math.max(320,camera+r.z),f=(camera/den)*mZoom;
  return{x:MW/2+r.x*f,y:MH/2+r.y*f,z:r.z,f};
}
function matrixVisibleCell(cell){return mCluster==='all'||cell.node.cluster===mCluster}
function matrixClusterVisible(k){return mCluster==='all'||k===mCluster}
function matrixLine(a,b,color,alpha=1,width=1,dash=[]){const A=projectPoint(a),B=projectPoint(b);mCtx.beginPath();mCtx.moveTo(A.x,A.y);mCtx.lineTo(B.x,B.y);mCtx.strokeStyle=color;mCtx.globalAlpha=alpha;mCtx.lineWidth=width;mCtx.setLineDash(dash);mCtx.stroke();mCtx.setLineDash([]);mCtx.globalAlpha=1}
function drawMatrixAxes(){
  const sx=340,sy=290,sz=330;
  matrixLine({x:-sx,y:0,z:0},{x:sx,y:0,z:0},'#22f2e6',.55,1.3);
  matrixLine({x:0,y:-sy,z:0},{x:0,y:sy,z:0},'#b9fffb',.35,1);
  matrixLine({x:0,y:0,z:-sz},{x:0,y:0,z:sz},'#8e78ff',.5,1.2,[5,5]);
}
function drawMatrixGrid(){
  for(let ci=0;ci<matrixCols.length;ci++){
    const x=(ci-(matrixCols.length-1)/2)*150;
    for(const k of clusterKeys){if(!matrixClusterVisible(k))continue;const z=clusterDepth.get(k)||0;matrixLine({x,y:-250,z},{x,y:250,z},'#1fc7c1',.08,1)}
  }
  for(const k of clusterKeys){if(!matrixClusterVisible(k))continue;const z=clusterDepth.get(k)||0;matrixLine({x:-330,y:0,z},{x:330,y:0,z},clusterColors[k]||'#22f2e6',.12,1)}
}
function drawMatrixLabels(){
  mCtx.font='10px ui-monospace, monospace';mCtx.textAlign='center';mCtx.textBaseline='middle';
  matrixCols.forEach((c,ci)=>{const p=projectPoint({x:(ci-(matrixCols.length-1)/2)*150,y:-285,z:0});mCtx.globalAlpha=.86;mCtx.fillStyle='#80fffa';mCtx.fillText(c[0].toUpperCase(),p.x,p.y)});
  mCtx.textAlign='left';
  for(const k of clusterKeys){if(!matrixClusterVisible(k))continue;const p=projectPoint({x:-355,y:0,z:clusterDepth.get(k)||0});mCtx.globalAlpha=.62;mCtx.fillStyle=clusterColors[k]||'#88b9b6';mCtx.fillText((clusters[k]?.label||k).toUpperCase(),p.x,p.y)}
  mCtx.globalAlpha=1;mCtx.textAlign='left';
}
function drawMatrix(){
  if(!MW||!MH)return;mCtx.clearRect(0,0,MW,MH);
  drawMatrixGrid();drawMatrixAxes();
  const projected=matrixCells.filter(matrixVisibleCell).map(cell=>({...cell,p:projectPoint(basePoint(cell))})).sort((a,b)=>b.p.z-a.p.z);
  // Row segments reveal the capability pattern of each concept.
  for(const n of rows){if(mCluster!=='all'&&n.cluster!==mCluster)continue;const flags=matrixFlags.get(n.id);const on=[];flags.forEach((v,i)=>{if(v)on.push(basePoint({node:n,colIndex:i,rowIndex:0}))});if(on.length>1){for(let i=1;i<on.length;i++)matrixLine(on[i-1],on[i],clusterColors[n.cluster]||'#22f2e6',n.id===mFocus?.7:.12,n.id===mFocus?1.8:.8,n.id===mFocus?[]:[2,5])}}
  for(const item of projected){
    const {cell,p}= {cell:item,p:item.p};
    const focused=item.node.id===mFocus,hovered=mHover&&mHover.node.id===item.node.id&&mHover.colIndex===item.colIndex;
    const color=clusterColors[item.node.cluster]||'#22f2e6';
    const r=(item.active?4.4:1.7)*Math.max(.55,Math.min(1.5,p.f))+(focused?1.4:0)+(hovered?1.5:0);
    mCtx.beginPath();mCtx.arc(p.x,p.y,r,0,Math.PI*2);
    if(item.active){mCtx.globalAlpha=focused?1:.78;mCtx.fillStyle=color;mCtx.shadowBlur=focused||hovered?18:8;mCtx.shadowColor=color;mCtx.fill();mCtx.shadowBlur=0;if(focused||hovered){mCtx.strokeStyle='#dffffd';mCtx.lineWidth=1;mCtx.stroke()}}
    else{mCtx.globalAlpha=focused?.42:.12;mCtx.fillStyle='#4b7777';mCtx.fill()}
  }
  mCtx.globalAlpha=1;drawMatrixLabels();
  // Focus label
  const n=byId.get(mFocus);if(n&&matrixClusterVisible(n.cluster)){const mid=projectPoint({x:0,y:(clusterOrderWithin.get(n.id)?.i-(clusterOrderWithin.get(n.id)?.count-1)/2)*44,z:clusterDepth.get(n.cluster)||0});mCtx.font='600 12px system-ui';mCtx.fillStyle='#eafffd';mCtx.shadowBlur=12;mCtx.shadowColor='#22f2e6';mCtx.fillText(n.title,mid.x+14,mid.y-10);mCtx.shadowBlur=0}
  updateMatrixReadouts();
}
function resizeMatrix(){const r=mStage.getBoundingClientRect();mCanvas.width=Math.max(1,r.width*devicePixelRatio);mCanvas.height=Math.max(1,r.height*devicePixelRatio);MW=r.width;MH=r.height;mCtx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);drawMatrix()}
new ResizeObserver(()=>{if($('#matrix').classList.contains('active')||document.fullscreenElement===mStage)resizeMatrix()}).observe(mStage);
const deg=r=>Math.round(r*180/Math.PI);
const rad=d=>Number(d)*Math.PI/180;
function syncMatrixControls(){
  $('#matrixX').value=deg(mRx);$('#matrixY').value=deg(mRy);$('#matrixZ').value=deg(mRz);$('#matrixZoom').value=Math.round(mZoom*100);
  $('#matrixXOut').textContent=`${deg(mRx)}°`;$('#matrixYOut').textContent=`${deg(mRy)}°`;$('#matrixZOut').textContent=`${deg(mRz)}°`;$('#matrixZoomOut').textContent=`${mZoom.toFixed(2)}×`;
}
function updateMatrixReadouts(){
  $('#matrixAngleReadout').textContent=`${deg(mRx)} / ${deg(mRy)} / ${deg(mRz)}`;$('#matrixZoomReadout').textContent=`${mZoom.toFixed(2)}×`;
}
function normalizeAngle(v){while(v>Math.PI)v-=Math.PI*2;while(v<-Math.PI)v+=Math.PI*2;return v}
['X','Y','Z'].forEach(axis=>{$(`#matrix${axis}`).oninput=e=>{if(axis==='X')mRx=rad(e.target.value);if(axis==='Y')mRy=rad(e.target.value);if(axis==='Z')mRz=rad(e.target.value);syncMatrixControls();drawMatrix()}});
$('#matrixZoom').oninput=e=>{mZoom=Number(e.target.value)/100;syncMatrixControls();drawMatrix()};
function resetMatrixView(){mRx=rad(-18);mRy=rad(28);mRz=rad(-2);mZoom=.95;mCluster='all';$('#matrixCluster').value='all';syncMatrixControls();drawMatrix()}
$('#matrixReset').onclick=resetMatrixView;
for(const k of clusterKeys){const o=document.createElement('option');o.value=k;o.textContent=clusters[k]?.label||k;$('#matrixCluster').append(o)}
$('#matrixCluster').onchange=e=>{mCluster=e.target.value;const first=rows.find(n=>mCluster==='all'||n.cluster===mCluster);if(first)mFocus=first.id;renderMatrixDetail();renderMatrixSignals();drawMatrix()};

function matrixHit(mx,my){let best=null,bd=14;for(const cell of matrixCells){if(!matrixVisibleCell(cell)||!cell.active)continue;const p=projectPoint(basePoint(cell)),d=Math.hypot(mx-p.x,my-p.y);if(d<bd){best={...cell,p};bd=d}}return best}
mCanvas.addEventListener('pointerdown',e=>{mDrag=true;mDragMode=e.shiftKey||e.button===2?'z':'xy';mLast={x:e.offsetX,y:e.offsetY};mTravel=0;mCanvas.setPointerCapture(e.pointerId)});
mCanvas.addEventListener('pointermove',e=>{
  if(mDrag){const dx=e.offsetX-mLast.x,dy=e.offsetY-mLast.y;mTravel+=Math.hypot(dx,dy);if(mDragMode==='z')mRz=normalizeAngle(mRz+dx*.008);else{mRy=normalizeAngle(mRy+dx*.008);mRx=normalizeAngle(mRx+dy*.008)}mLast={x:e.offsetX,y:e.offsetY};syncMatrixControls();drawMatrix();return}
  const h=matrixHit(e.offsetX,e.offsetY);if((h?.node.id)!==(mHover?.node.id)||h?.colIndex!==mHover?.colIndex){mHover=h;drawMatrix()}
});
mCanvas.addEventListener('pointerup',e=>{const h=matrixHit(e.offsetX,e.offsetY);mDrag=false;if(h&&mTravel<8){mFocus=h.node.id;renderMatrixDetail(h);renderMatrixSignals();drawMatrix()}});
mCanvas.addEventListener('pointerleave',()=>{if(!mDrag&&mHover){mHover=null;drawMatrix()}});
mCanvas.addEventListener('contextmenu',e=>e.preventDefault());
mCanvas.addEventListener('wheel',e=>{e.preventDefault();mZoom=Math.max(.55,Math.min(2.2,mZoom*Math.exp(-e.deltaY*.001)));syncMatrixControls();drawMatrix()},{passive:false});
mCanvas.addEventListener('keydown',e=>{let used=true;if(e.key==='ArrowUp')mRx-=.06;else if(e.key==='ArrowDown')mRx+=.06;else if(e.key==='ArrowLeft')mRy-=.06;else if(e.key==='ArrowRight')mRy+=.06;else if(e.key.toLowerCase()==='q')mRz-=.06;else if(e.key.toLowerCase()==='e')mRz+=.06;else used=false;if(used){e.preventDefault();mRx=normalizeAngle(mRx);mRy=normalizeAngle(mRy);mRz=normalizeAngle(mRz);syncMatrixControls();drawMatrix()}});

function renderMatrixDetail(hit=null){
  const n=byId.get(mFocus);if(!n)return;const flags=matrixFlags.get(n.id)||[];const activeNames=matrixCols.filter((_,i)=>flags[i]).map(c=>c[0]);
  $('#matrixDetail').innerHTML=`<div class="panelLabel">FOCUS TRACE</div><div class="eyebrow">${clusters[n.cluster]?.label||n.cluster}</div><h3>${n.title}</h3><p class="small">${n.summary}</p>${n.formula?`<div class="formula">${n.formula}</div>`:''}<div class="matrixFeatureRow">${matrixCols.map((c,i)=>`<span class="matrixFeature ${flags[i]?'on':''}">${c[0]}</span>`).join('')}</div>${hit?`<p class="small">Selected cell: <strong>${hit.label}</strong></p>`:''}<p><a href="#" id="matrixOpenAtlas">Open concept in Atlas →</a></p>`;
  $('#matrixOpenAtlas').onclick=e=>{e.preventDefault();selectNode(n.id);$$('#tabs button').find(x=>x.dataset.tab==='map').click()};
  void activeNames;
}
function renderMatrixSignals(){
  const filtered=rows.filter(n=>mCluster==='all'||n.cluster===mCluster),den=Math.max(1,filtered.length);
  $('#matrixSignalBars').innerHTML=matrixCols.map((c,i)=>{const count=filtered.filter(n=>matrixFlags.get(n.id)[i]).length,pct=Math.round(count/den*100);return `<div class="matrixSignalRow"><span>${c[0]}</span><div class="matrixSignalTrack"><div class="matrixSignalFill" style="width:${pct}%"></div></div><b>${pct}%</b></div>`}).join('');
}
renderMatrixDetail();renderMatrixSignals();syncMatrixControls();

function animateMatrix(t){if(!mAuto){mRaf=0;return}if(mLastFrame){const dt=Math.min(40,t-mLastFrame);mRy=normalizeAngle(mRy+dt*.00018);mRz=normalizeAngle(mRz+dt*.000045)}mLastFrame=t;syncMatrixControls();drawMatrix();mRaf=requestAnimationFrame(animateMatrix)}
$('#matrixAutoSpin').onclick=()=>{mAuto=!mAuto;$('#matrixAutoSpin').setAttribute('aria-pressed',String(mAuto));$('#matrixAutoSpin').textContent=mAuto?'Pause rotation':'Auto rotate';mLastFrame=0;if(mAuto&&!mRaf)mRaf=requestAnimationFrame(animateMatrix)};

async function toggleMatrixFullscreen(){
  if(document.fullscreenElement===mStage){await document.exitFullscreen();return}
  if(mStage.requestFullscreen){await mStage.requestFullscreen();return}
  mStage.classList.toggle('fullscreenFallback');document.body.style.overflow=mStage.classList.contains('fullscreenFallback')?'hidden':'';resizeMatrix();
}
$('#matrixFullscreen').onclick=()=>toggleMatrixFullscreen().catch(()=>{mStage.classList.toggle('fullscreenFallback');document.body.style.overflow=mStage.classList.contains('fullscreenFallback')?'hidden':'';resizeMatrix()});
document.addEventListener('fullscreenchange',()=>{$('#matrixFullscreen').textContent=document.fullscreenElement===mStage?'⤡ Exit full screen':'⛶ Full screen';requestAnimationFrame(resizeMatrix)});

// Matrix readable fallback
$('#matrixTable').innerHTML=`<div class="tableWrap"><table><thead><tr><th>Concept</th><th>Cluster</th>${matrixCols.map(c=>`<th>${c[0]}</th>`).join('')}</tr></thead><tbody>${rows.map(n=>`<tr data-matrix-node="${n.id}"><td>${n.title}</td><td>${clusters[n.cluster].label}</td>${matrixCols.map(c=>`<td class="${c[1](n)?'yes':'no'}">${c[1](n)?'●':'·'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
$$('[data-matrix-node]').forEach(tr=>tr.onclick=()=>{mFocus=tr.dataset.matrixNode;renderMatrixDetail();renderMatrixSignals();drawMatrix();mStage.scrollIntoView({behavior:'smooth',block:'center'})});

// Routes
function routeNames(ids){return ids.map(id=>byId.get(id)?.title||id)}
routes.forEach(r=>{const d=document.createElement('div');d.className='routeCard';d.innerHTML=`<strong>${r.title}</strong><p class="small">${r.note}</p><div class="routePath">${routeNames(r.nodes).map((x,i)=>`${i?'<b>→</b>':''}<span>${x}</span>`).join('')}</div>`;$('#routeCards').append(d)});
for(const sel of [$('#routeFrom'),$('#routeTo')])for(const n of nodes){const o=document.createElement('option');o.value=n.id;o.textContent=n.title;sel.append(o)}
$('#routeFrom').value='pell';$('#routeTo').value='rust-target';
function shortest(s,t){const adj=new Map(nodes.map(n=>[n.id,[]]));for(const e of edges){adj.get(e.source).push(e.target);if(!e.directed)adj.get(e.target).push(e.source)}const q=[s],prev=new Map([[s,null]]);while(q.length){const u=q.shift();if(u===t)break;for(const v of adj.get(u)||[])if(!prev.has(v)){prev.set(v,u);q.push(v)}}if(!prev.has(t))return[];const out=[];for(let x=t;x;x=prev.get(x))out.push(x);return out.reverse()}
$('#routeGo').onclick=()=>{const r=shortest($('#routeFrom').value,$('#routeTo').value);$('#routeResult').innerHTML=r.length?`<div class="routeCard"><div class="routePath">${routeNames(r).map((x,i)=>`${i?'<b>→</b>':''}<span>${x}</span>`).join('')}</div></div>`:'<p>No route.</p>'};

// Sources
const stats=Object.entries(meta.sourceGroups).map(([k,v])=>`<span>${k}: ${v}</span>`).join('');$('#sourceStats').className='sourceStats';$('#sourceStats').innerHTML=stats;
function renderSources(){const q=$('#sourceSearch').value.toLowerCase();const arr=sources.filter(s=>!q||s.title.toLowerCase().includes(q)||s.group.includes(q)).slice(0,400);$('#sourceList').innerHTML=arr.map(s=>`<div class="sourceItem"><div class="group">${s.group}</div><div><strong><a href="public/${s.localPath}" target="_blank">${s.title}</a></strong><span class="small">${s.source||'local capture'}</span></div><code>${s.sha256.slice(0,12)}</code></div>`).join('')}
$('#sourceSearch').oninput=renderSources;renderSources();
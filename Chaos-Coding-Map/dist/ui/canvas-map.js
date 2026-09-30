import { neighborhood } from '../core/graph.js';

function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function distToSegment(px,py,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1; if(!dx&&!dy)return Math.hypot(px-x1,py-y1); const t=clamp(((px-x1)*dx+(py-y1)*dy)/(dx*dx+dy*dy),0,1); return Math.hypot(px-(x1+t*dx),py-(y1+t*dy));}

export class CanvasMap {
  constructor(canvas, graph, callbacks={}) {
    this.canvas=canvas; this.ctx=canvas.getContext('2d'); this.graph=graph; this.cb=callbacks;
    this.zoom=.76; this.panX=80; this.panY=90; this.selectedNode=null; this.selectedEdge=null; this.route=null; this.visibleNodes=new Set(graph.nodes.map(n=>n.id));
    this.dragging=false; this.last={x:0,y:0}; this.down={x:0,y:0}; this.hoverNode=null; this.chaos=false; this.temperature=.08; this.phase=0;
    this.basePos=new Map(graph.nodes.map(n=>[n.id,{x:n.x??0,y:n.y??0}]));
    this.chaosPos=new Map(graph.nodes.map(n=>[n.id,{x:n.x??0,y:n.y??0,vx:0,vy:0}])); this.attractor=.55; this.repulsion=.45;
    this.bind(); this.resize(); this.fit(false); this.loop();
  }
  destroy(){cancelAnimationFrame(this.raf);this.ro?.disconnect()}
  bind(){
    this.ro=new ResizeObserver(()=>this.resize()); this.ro.observe(this.canvas.parentElement);
    this.canvas.addEventListener('wheel',e=>{e.preventDefault();const r=this.canvas.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;const before=this.screenToWorld(mx,my);this.zoom=clamp(this.zoom*Math.exp(-e.deltaY*.0012),.18,4.5);const after=this.worldToScreen(before.x,before.y);this.panX+=mx-after.x;this.panY+=my-after.y;},{passive:false});
    this.canvas.addEventListener('pointerdown',e=>{const p=this.local(e);this.dragging=true;this.last=p;this.down=p;this.canvas.setPointerCapture(e.pointerId)});
    this.canvas.addEventListener('pointermove',e=>{const p=this.local(e);if(this.dragging){this.panX+=p.x-this.last.x;this.panY+=p.y-this.last.y;this.last=p}else this.updateHover(p)});
    this.canvas.addEventListener('pointerup',e=>{const p=this.local(e);const moved=Math.hypot(p.x-this.down.x,p.y-this.down.y);this.dragging=false; if(moved<5)this.pick(p,e.shiftKey)});
    this.canvas.addEventListener('pointercancel',()=>this.dragging=false);
  }
  local(e){const r=this.canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
  resize(){const r=this.canvas.parentElement.getBoundingClientRect(),dpr=window.devicePixelRatio||1;this.canvas.width=Math.max(1,r.width*dpr);this.canvas.height=Math.max(1,r.height*dpr);this.canvas.style.width=r.width+'px';this.canvas.style.height=r.height+'px';this.w=r.width;this.h=r.height;this.dpr=dpr;}
  worldToScreen(x,y){return{x:x*this.zoom+this.panX,y:y*this.zoom+this.panY}}
  screenToWorld(x,y){return{x:(x-this.panX)/this.zoom,y:(y-this.panY)/this.zoom}}
  fit(animated=true){const vis=this.graph.nodes.filter(n=>this.visibleNodes.has(n.id));if(!vis.length)return;const xs=vis.map(n=>n.x),ys=vis.map(n=>n.y);const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);const z=clamp(Math.min((this.w-160)/(maxX-minX+100),(this.h-140)/(maxY-minY+100)),.22,1.5);this.moveCamera((this.w/2)-((minX+maxX)/2)*z,(this.h/2)-((minY+maxY)/2)*z,z,animated)}
  moveCamera(px,py,z,animated=true){if(!animated){this.panX=px;this.panY=py;this.zoom=z;return}const s={x:this.panX,y:this.panY,z:this.zoom},t0=performance.now();const step=now=>{const t=clamp((now-t0)/420,0,1),k=1-Math.pow(1-t,3);this.panX=s.x+(px-s.x)*k;this.panY=s.y+(py-s.y)*k;this.zoom=s.z+(z-s.z)*k;if(t<1)requestAnimationFrame(step)};requestAnimationFrame(step)}
  centerNode(id){const n=this.graph.byId.get(id);if(!n)return;const z=Math.max(this.zoom,1.15);this.moveCamera(this.w/2-n.x*z,this.h/2-n.y*z,z,true)}
  setVisible(ids){this.visibleNodes=new Set(ids);this.fit(true)}
  setSelection(nodeId,edgeId=null){this.selectedNode=nodeId;this.selectedEdge=edgeId}
  setRoute(route){this.route=route}
  setChaos(on,temp=.08,attractor=this.attractor,repulsion=this.repulsion){this.chaos=on;this.temperature=temp;this.attractor=attractor;this.repulsion=repulsion}
  updateHover(p){let best=null,bd=18;for(const n of this.graph.nodes){if(!this.visibleNodes.has(n.id))continue;const q=this.position(n),s=this.worldToScreen(q.x,q.y),d=Math.hypot(p.x-s.x,p.y-s.y);if(d<bd){bd=d;best=n.id}}this.hoverNode=best;this.canvas.style.cursor=best?'pointer':'grab'}
  pick(p,shift){let best=null,bd=20;for(const n of this.graph.nodes){if(!this.visibleNodes.has(n.id))continue;const q=this.position(n),s=this.worldToScreen(q.x,q.y),d=Math.hypot(p.x-s.x,p.y-s.y);if(d<bd){bd=d;best=n}}if(best){this.selectedNode=best.id;this.selectedEdge=null;this.centerNode(best.id);this.cb.onNode?.(best,shift);return}
    let edgeHit=null,ed=10;for(const e of this.graph.edges){if(!this.visibleNodes.has(e.source)||!this.visibleNodes.has(e.target))continue;const a=this.graph.byId.get(e.source),b=this.graph.byId.get(e.target),ap=this.position(a),bp=this.position(b);const as=this.worldToScreen(ap.x,ap.y),bs=this.worldToScreen(bp.x,bp.y),d=distToSegment(p.x,p.y,as.x,as.y,bs.x,bs.y);if(d<ed){ed=d;edgeHit=e}}if(edgeHit){this.selectedEdge=edgeHit.id;this.selectedNode=null;this.cb.onEdge?.(edgeHit)}
  }
  loop=()=>{this.draw();this.raf=requestAnimationFrame(this.loop)}
  draw(){if(this.chaos)this.stepChaos();const c=this.ctx,d=this.dpr;c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,this.w,this.h);this.phase+=.012;
    const grad=c.createRadialGradient(this.w*.48,this.h*.42,20,this.w*.48,this.h*.42,Math.max(this.w,this.h));grad.addColorStop(0,'#111a28');grad.addColorStop(1,'#05080d');c.fillStyle=grad;c.fillRect(0,0,this.w,this.h);this.grid(c);
    const near=this.selectedNode?neighborhood(this.graph,this.selectedNode,2):null; const one=this.selectedNode?neighborhood(this.graph,this.selectedNode,1):null; const routeEdges=new Set(this.route?.edges||[]);
    for(const e of this.graph.edges){if(!this.visibleNodes.has(e.source)||!this.visibleNodes.has(e.target))continue;const a=this.graph.byId.get(e.source),b=this.graph.byId.get(e.target),ap=this.position(a),bp=this.position(b);const as=this.worldToScreen(ap.x,ap.y),bs=this.worldToScreen(bp.x,bp.y);let alpha=.13,width=.65;if(routeEdges.has(e.id)){alpha=.95;width=3}else if(this.selectedEdge===e.id){alpha=1;width=3}else if(this.selectedNode&&(e.source===this.selectedNode||e.target===this.selectedNode)){alpha=.8;width=1.8}else if(near&&(near.has(e.source)&&near.has(e.target)))alpha=.35;
      c.save();c.globalAlpha=alpha;c.lineWidth=width;c.strokeStyle=e.kind==='curated implementation bridge'?'#f4d06f':e.kind==='curated neighbor'?'#ef8fb8':e.kind==='source-backed annotation'||e.kind==='source-backed'?'#71e7d6':e.kind==='generated'?'#8d9db5':'#7b91ae';if(e.kind.includes('curated'))c.setLineDash([7,7]);else if(e.kind==='generated')c.setLineDash([2,7]);c.beginPath();c.moveTo(as.x,as.y);c.lineTo(bs.x,bs.y);c.stroke();c.restore();}
    for(const n of this.graph.nodes){if(!this.visibleNodes.has(n.id))continue;const p=this.position(n),s=this.worldToScreen(p.x,p.y);const sel=n.id===this.selectedNode,hov=n.id===this.hoverNode;let alpha=.52;if(this.selectedNode){if(n.id===this.selectedNode)alpha=1;else if(one?.has(n.id))alpha=.95;else if(near?.has(n.id))alpha=.42;else alpha=.1}c.save();c.globalAlpha=alpha;const color=this.graph.clusters[n.primaryCluster]?.color||'#cbd5e1';const r=sel?9:hov?7:Math.max(3.6,Math.min(6.7,3.6+Math.log2(1+n.degree)*.55));c.shadowColor=color;c.shadowBlur=sel?18:hov?10:0;c.fillStyle=color;c.beginPath();c.arc(s.x,s.y,r,0,Math.PI*2);c.fill();c.restore();
      const labelLevel=this.zoom<.5?0:this.zoom<.9?1:2;if(n.semanticLevel<=labelLevel || sel || hov){c.save();c.globalAlpha=sel?1:Math.max(.25,alpha);c.fillStyle='#eaf3ff';c.font=`${sel?'600 ':'400 '}${sel?13:11}px ui-monospace, SFMono-Regular, Menlo, monospace`;c.fillText(n.title,s.x+r+5,s.y+4);c.restore();}}
  }
  position(n){if(!this.chaos)return n;return this.chaosPos.get(n.id)||n}
  stepChaos(){
    const ids=[...this.visibleNodes]; const temp=this.temperature;
    for(const id of ids){const p=this.chaosPos.get(id),b=this.basePos.get(id); if(!p||!b)continue; const anchor=.0025+(.012*(1-temp)); p.vx+=(b.x-p.x)*anchor; p.vy+=(b.y-p.y)*anchor;}
    for(const e of this.graph.edges){if(!this.visibleNodes.has(e.source)||!this.visibleNodes.has(e.target))continue;const a=this.chaosPos.get(e.source),b=this.chaosPos.get(e.target);if(!a||!b)continue;let dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy));const desired=e.kind.includes('curated')?150:e.kind==='generated'?175:112;const strength=(.00055+.0012*this.attractor)*(e.confidence??.5);const f=(d-desired)*strength;dx/=d;dy/=d;a.vx+=dx*f;a.vy+=dy*f;b.vx-=dx*f;b.vy-=dy*f;}
    for(let i=0;i<ids.length;i++){const a=this.chaosPos.get(ids[i]);if(!a)continue;for(let j=i+1;j<ids.length;j++){const b=this.chaosPos.get(ids[j]);if(!b)continue;let dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy+80;if(d2>90000)continue;const d=Math.sqrt(d2),f=(70+125*this.repulsion)/d2;dx/=d;dy/=d;a.vx-=dx*f*55;a.vy-=dy*f*55;b.vx+=dx*f*55;b.vy+=dy*f*55;}}
    for(const id of ids){const p=this.chaosPos.get(id);if(!p)continue;const noise=temp*.11;const h=(id.charCodeAt(id.length-1)||1);p.vx+=Math.sin(this.phase*1.37+h)*noise;p.vy+=Math.cos(this.phase*1.11+h*.7)*noise;p.vx*=.88;p.vy*=.88;const vmax=1.8+temp*5,sp=Math.hypot(p.vx,p.vy);if(sp>vmax){p.vx=p.vx/sp*vmax;p.vy=p.vy/sp*vmax}p.x+=p.vx;p.y+=p.vy;}
  }
  grid(c){const step=64*this.zoom;if(step<18)return;c.save();c.strokeStyle='rgba(118,153,190,.055)';c.lineWidth=1;const ox=((this.panX%step)+step)%step,oy=((this.panY%step)+step)%step;c.beginPath();for(let x=ox;x<this.w;x+=step){c.moveTo(x,0);c.lineTo(x,this.h)}for(let y=oy;y<this.h;y+=step){c.moveTo(0,y);c.lineTo(this.w,y)}c.stroke();c.restore()}
}

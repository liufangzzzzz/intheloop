'use client';
import {useEffect,useRef,useState} from 'react';
import type {Tag,Locale} from '../../lib/atlas';
type Point={x:number;y:number;z:number;title:string;href:string;group:boolean;medium:boolean};
export default function Orbit({tags,locale}:{tags:Tag[];locale:Locale}){
 const zh=locale==='zh';
 const sphereRef=useRef<HTMLDivElement>(null);
 const [size,setSize]=useState({w:900,h:550});
 const [expanded,setExpanded]=useState(false);
 useEffect(()=>{const node=sphereRef.current;if(!node)return;const observer=new ResizeObserver(()=>setSize({w:node.clientWidth,h:node.clientHeight}));observer.observe(node);return()=>observer.disconnect()},[]);
 const [rotation,setRotation]=useState({x:-.12,y:.28}),[paused,setPaused]=useState(false),[,setFocused]=useState(false),[,setHovered]=useState(false),[dragging,setDragging]=useState(false);
 const drag=useRef<{x:number;y:number;rx:number;ry:number}|null>(null),moved=useRef(false);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(paused||dragging||media.matches)return;
  let frame=0,last=0;
  const tick=(time:number)=>{const elapsed=last?Math.min(time-last,60):0;last=time;if(elapsed)setRotation(r=>({x:r.x+elapsed*.000012,y:r.y+elapsed*.000042}));frame=requestAnimationFrame(tick)};
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[paused,dragging]);
 const nodes=tags.filter(t=>t.map_visible!==false);
 const leaves:Point[]=nodes.map(t=>{const primary=t.map_level==='primary',pool=nodes.filter(n=>(n.map_level==='primary')===primary),index=pool.findIndex(n=>n.id===t.id),y=1-2*(index+.5)/Math.max(pool.length,1),r=Math.sqrt(1-y*y),a=index*2.399963+(primary?.4:1.8);return{x:Math.cos(a)*r,y,z:Math.sin(a)*r,title:zh?t.name_zh:t.name_en||t.name_zh,href:`/${locale}?tag=${t.slug}`,group:t.map_level==='primary',medium:t.map_level==='medium'}});
 const mobile=size.w<=650;
 const points=leaves.map(p=>{
  const x=p.x*Math.cos(rotation.y)+p.z*Math.sin(rotation.y),z0=-p.x*Math.sin(rotation.y)+p.z*Math.cos(rotation.y),y=p.y*Math.cos(rotation.x)-z0*Math.sin(rotation.x),z=p.y*Math.sin(rotation.x)+z0*Math.cos(rotation.x),perspective=2.9/(2.9-z),scale=.75+(z+1)*.2;
  const font=p.group?(mobile?21:30):p.medium?(mobile?18:24):(mobile?14:19),maxWidth=mobile?(p.group?120:100):180;
  const estimated=[...p.title].reduce((a,c)=>a+(/[\u3000-\u9fff]/.test(c)?font:font*.55),0)+14;
  const px=size.w*(.5+x*.32*perspective),py=size.h*(.5+y*.34*perspective);
  const distance=Math.hypot((px-size.w/2)/(mobile?100:155),(py-size.h/2)/(mobile?68:95));
  const centerFade=Math.max(0,Math.min(1,(distance-.75)/.45));
  return {...p,px,py,z,scale,centerFade,w:Math.min(maxWidth,estimated)*scale,h:(Math.ceil(estimated/maxWidth)*font*1.3+20)*scale};
 });
 // Keep every label on its spherical path. When two labels cross, soften the
 // one that is farther back instead of pushing either label into a rigid row.
 const collisionFade=new Map<string,number>(),accepted:typeof points=[];
 [...points].sort((a,b)=>Number(b.group)-Number(a.group)||Number(b.medium)-Number(a.medium)||b.z-a.z).forEach(p=>{
  const overlap=accepted.some(a=>{
   const width=Math.max(0,Math.min(p.px+p.w/2,a.px+a.w/2)-Math.max(p.px-p.w/2,a.px-a.w/2));
   const height=Math.max(0,Math.min(p.py+p.h/2,a.py+a.h/2)-Math.max(p.py-p.h/2,a.py-a.h/2));
   return width*height/Math.max(1,Math.min(p.w*p.h,a.w*a.h))>.22;
  });
  collisionFade.set(p.href,overlap?.22:1);
  if(!overlap)accepted.push(p);
 });

 return <section className={"space-map " + (expanded?"map-expanded":"map-ambient")} aria-label={zh?'具身智能内容地图':'Embodied AI content map'}>
  <div ref={sphereRef} className={'sphere '+(dragging?'dragging':'')} tabIndex={expanded?0:-1} aria-describedby="map-help"
   onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>{setHovered(false);if(!dragging)drag.current=null}}
   onFocus={e=>setFocused((e.target as HTMLElement).matches(':focus-visible'))} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false)}}
   onPointerDown={e=>{if(!expanded||e.button!==0)return;moved.current=false;drag.current={x:e.clientX,y:e.clientY,rx:rotation.x,ry:rotation.y}}}
   onPointerMove={e=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.hypot(dx,dy)>5){moved.current=true;setDragging(true);e.currentTarget.setPointerCapture(e.pointerId);setRotation({x:d.rx+dy*.007,y:d.ry+dx*.007})}}}
   onPointerUp={e=>{drag.current=null;setDragging(false);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}}
   onPointerCancel={()=>{drag.current=null;setDragging(false)}}
   onClickCapture={e=>{if(moved.current){e.preventDefault();e.stopPropagation()}}}
   onKeyDown={e=>{if(expanded&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setPaused(true);setRotation(r=>({x:r.x+(e.key==='ArrowUp'?-.2:e.key==='ArrowDown'?.2:0),y:r.y+(e.key==='ArrowLeft'?-.2:e.key==='ArrowRight'?.2:0)}))}}}>
   <div className="map-wordmark" aria-hidden="true"><span>In The</span><strong>Loop</strong></div>
   {points.map(p=><a key={p.href} className={'map-node '+(p.group?'group':p.medium?'medium':'leaf')} href={p.href} tabIndex={expanded?0:-1} aria-hidden={!expanded} style={{left:p.px,top:p.py,opacity:(expanded?.6+(p.z+1)*.2:.22+(p.z+1)*.28)*p.centerFade*(collisionFade.get(p.href)||1),pointerEvents:expanded&&p.centerFade>.2&&(collisionFade.get(p.href)||1)>.5?'auto':'none',filter:expanded?'none':`blur(${.35+(1-p.z)*.45}px)`,transform:`translate(-50%,-50%) scale(${p.scale})`,zIndex:Math.round((p.z+1)*10)+2}}>{p.title}</a>)}
   {!expanded&&<button className="map-enter" aria-label={zh?'展开地图':'Explore the map'} onClick={()=>{setExpanded(true);setFocused(false)}}/>}
  </div>
  <div className="map-caption"><p id="map-help">{expanded?(zh?'拖动翻转 · 点击进入':'Drag to rotate · Select a topic'):(zh?'点击展开地图':'Explore the map')}</p><button onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?(zh?'继续':'Resume'):(zh?'暂停':'Pause')}</button>{expanded&&<button onClick={()=>{setExpanded(false);setPaused(false);setFocused(false);moved.current=false;drag.current=null}}>{zh?'收起':'Close'}</button>}</div>
 </section>
}

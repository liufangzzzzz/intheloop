"use client";

import {useMemo,useState} from "react";

type Chapter={label:string;title:string;seconds:number;end:number|null};
const stamp=/^\s*(?:[-*]\s*)?(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+?)\s*$/;
const inlineStamp=/\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?/;
function seconds(value:string){const parts=value.split(":").map(Number);return parts.length===3?parts[0]*3600+parts[1]*60+parts[2]:parts[0]*60+parts[1]}
function parseShownote(value:string){
 const lines=value.replace(/\r/g,"").split("\n"),chapters:Omit<Chapter,"end">[]=[];
 const notes:string[]=[];
 for(const line of lines){const match=line.match(stamp);if(match){chapters.push({label:match[1],title:match[2].trim(),seconds:seconds(match[1])});continue}if(/^[#*\s【】]*精彩(?:时刻|节点)[#*\s【】]*$/i.test(line.trim()))continue;notes.push(line)}
 return {notes:notes.join("\n").replace(/\n{3,}/g,"\n\n").trim(),chapters:chapters.map((chapter,index)=>({...chapter,end:chapters[index+1]?.seconds??null}))};
}
function transcriptBlocks(value:string){
 const lines=value.replace(/\r/g,"").split("\n"),blocks:{seconds:number|null;text:string}[]=[];let current:{seconds:number|null;text:string}|null=null;
 for(const line of lines){const found=line.match(inlineStamp);if(found){if(current?.text.trim())blocks.push({...current,text:current.text.trim()});current={seconds:seconds(found[1]),text:line}}else if(current)current.text+="\n"+line;else if(line.trim())blocks.push({seconds:null,text:line.trim()})}
 if(current?.text.trim())blocks.push({...current,text:current.text.trim()});return blocks;
}
export default function PodcastReader({shownote,transcript}:{shownote:string;transcript:string}){
 const parsed=useMemo(()=>parseShownote(shownote),[shownote]),blocks=useMemo(()=>transcriptBlocks(transcript),[transcript]);
 const [pane,setPane]=useState<"shownote"|"chapters">("shownote"),[open,setOpen]=useState<Set<number>>(()=>new Set());
 const chapters:Chapter[]=parsed.chapters.length?parsed.chapters:[{label:"00:00",title:"完整全文",seconds:0,end:null}];
 const segment=(chapter:Chapter)=>blocks.filter(block=>block.seconds!==null&&block.seconds>=chapter.seconds&&(chapter.end===null||block.seconds<chapter.end));
 return <section className={`podcast-reader pane-${pane}`}>
  {pane==="shownote"?<div className="podcast-shownote"><header><div><p>SHOW NOTES</p><h2>本期内容</h2></div><button className="podcast-pane-switch" onClick={()=>setPane("chapters")}>查看章节与全文 →</button></header><div>{parsed.notes.split(/\n{2,}/).filter(Boolean).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div></div>:<div className="podcast-chapters"><header><div><p>CHAPTERS / TRANSCRIPT</p><h2>精彩时刻</h2></div><button className="podcast-pane-switch" onClick={()=>setPane("shownote")}>← 返回 Shownote</button></header>
   {!parsed.chapters.length&&<div className="chapter-empty"><p>Shownote 中暂时没有可识别的时间点，可直接展开全文。</p></div>}
   <div className="chapter-list">{chapters.map((chapter,index)=>{const expanded=open.has(index),items=segment(chapter);return <section className={expanded?"expanded":""} key={`${chapter.label}-${index}`}><button aria-expanded={expanded} onClick={()=>setOpen(current=>{const next=new Set(current);if(next.has(index))next.delete(index);else next.add(index);return next})}><time>{chapter.label}</time><strong>{chapter.title}</strong><span>{expanded?"−":"+"}</span></button>{expanded&&<div className="chapter-transcript">{items.length?items.map((block,i)=><p key={i}>{block.text}</p>):<p>这一时段没有匹配到带时间轴的逐字稿。</p>}</div>}</section>})}</div>
   <button className="full-transcript-toggle" aria-expanded={open.size===chapters.length} onClick={()=>setOpen(open.size===chapters.length?new Set():new Set(chapters.map((_,index)=>index)))}>{open.size===chapters.length?"全部收起":"展开完整全文"}<span>{open.size===chapters.length?"−":"+"}</span></button>
  </div>}
 </section>
}

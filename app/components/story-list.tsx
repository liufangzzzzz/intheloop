import type {Content,Locale,Tag} from '../../lib/atlas';
import {contentTarget,sourceName} from '../../lib/atlas-public';
export function RelatedLinks({content,locale}:{content:Content;locale:Locale}){
 const resources=content.resources||[],legacy=content.versions[locale]?.links||[];
 if(!resources.length&&!legacy.length)return null;
 return <details className="related-reading"><summary>{locale==='zh'?'配套内容':'Further reading'} <span>{resources.length+legacy.length}</span></summary><div className="resource-links">{resources.map((r,i)=><a key={i} href={r.url} target="_blank" rel="noreferrer">{locale==='en'?(r.label_en||r.label):r.label} ↗</a>)}{legacy.map((r,i)=><a key={'legacy'+i} href={r.url} target="_blank" rel="noreferrer">{r.label} ↗</a>)}</div></details>
}
export default function StoryList({entries,locale,tags}:{entries:Content[];locale:Locale;tags?:Tag[]}){
 const zh=locale==='zh';
 const byId=new Map((tags||[]).map(tag=>[tag.id,tag]));
 const labels=(content:Content)=>{
  const direct=content.tag_ids.map(id=>byId.get(id)).filter((tag):tag is Tag=>!!tag);
  const editorial=direct.filter(tag=>tag.tag_type==='content_type'&&!['editorial:content','content'].includes(tag.id));
  const roots=new Map<string,Tag>();
  const addRoot=(tag:Tag,seen=new Set<string>())=>{if(seen.has(tag.id))return;seen.add(tag.id);const parents=(tag.parent_ids||[]).map(id=>byId.get(id)).filter((parent):parent is Tag=>!!parent&&parent.tag_type==='technical_topic');if(!parents.length){if(tag.tag_type==='technical_topic')roots.set(tag.id,tag);return}parents.forEach(parent=>addRoot(parent,seen))};
  direct.filter(tag=>tag.tag_type==='technical_topic').forEach(tag=>addRoot(tag));
  return [...editorial,...roots.values()].slice(0,3);
 };
 return <div className="timeline">{entries.map(c=>{const v=c.versions[locale],target=contentTarget(c,locale),context=labels(c),kind=c.kind==='podcast'?(zh?'播客':'Podcast'):c.section==='overseas'&&zh?'海外观察':'';return <article className="timeline-entry" key={c.id}><div className="entry-meta"><time dateTime={c.date}>{c.date}</time>{kind&&<span className={`entry-kind kind-${c.kind}`}>{kind}</span>}{context.map(tag=><a key={tag.id} href={`/${locale}?tag=${tag.slug}`}>{zh?tag.name_zh:tag.name_en||tag.name_zh}</a>)}{target.external&&<span className="entry-source">{sourceName(target.href,locale)} ↗</span>}</div><a className="entry-title" href={target.href} target={target.external?'_blank':undefined} rel={target.external?'noreferrer':undefined}><h2>{v?.title}</h2><span aria-hidden="true">{target.external?'↗':'→'}</span></a>{(v?.reading_hint||v?.summary)&&<p>{v.reading_hint||v.summary}</p>}<RelatedLinks content={c} locale={locale}/></article>})}{!entries.length&&<p className="timeline-empty">{zh?'这里暂时没有已发布内容。':'No published stories yet.'}</p>}</div>
}

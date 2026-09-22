import type {Content,Locale} from '../../lib/atlas';
import {contentTarget,sourceName,brandName} from '../../lib/atlas-public';
export function RelatedLinks({content,locale}:{content:Content;locale:Locale}){
 const resources=content.resources||[],legacy=content.versions[locale]?.links||[];
 if(!resources.length&&!legacy.length)return null;
 return <details className="related-reading"><summary>{locale==='zh'?'配套内容':'Further reading'} <span>{resources.length+legacy.length}</span></summary><div className="resource-links">{resources.map((r,i)=><a key={i} href={r.url} target="_blank" rel="noreferrer">{locale==='en'?(r.label_en||r.label):r.label} ↗</a>)}{legacy.map((r,i)=><a key={'legacy'+i} href={r.url} target="_blank" rel="noreferrer">{r.label} ↗</a>)}</div></details>
}
export default function StoryList({entries,locale}:{entries:Content[];locale:Locale}){
 const zh=locale==='zh';
 return <div className="timeline">{entries.map(c=>{const v=c.versions[locale],target=contentTarget(c,locale);return <article className="timeline-entry" key={c.id}><div className="entry-meta"><time dateTime={c.date}>{c.date}</time><span>{c.section==='overseas'&&zh?'海外观察':c.kind==='podcast'?(zh?'播客':'Podcast'):(zh?'文章':'Article')}</span><span>{brandName(c,locale)}</span>{target.external&&<span>{sourceName(target.href,locale)}</span>}</div><a className="entry-title" href={target.href} target={target.external?'_blank':undefined} rel={target.external?'noreferrer':undefined}><h2>{v?.title}</h2><span aria-hidden="true">{target.external?'↗':'→'}</span></a>{v?.summary&&<p>{v.summary}</p>}<RelatedLinks content={c} locale={locale}/></article>})}{!entries.length&&<p className="timeline-empty">{zh?'这里暂时没有已发布内容。':'No published stories yet.'}</p>}</div>
}

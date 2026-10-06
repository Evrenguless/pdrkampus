#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Render editorial previews from verified public facts, without application writes."""
import argparse, html, json, re
from pathlib import Path
from urllib.parse import urlsplit
from seo_engine import Page, protected, safe_output

def validate(manifest):
    if manifest.get('publication') != 'preview_only':
        raise ValueError('Only preview publication is supported')
    if manifest.get('verification', {}).get('basis') != 'user_manual_verification':
        raise ValueError('Verification declaration missing')
    if len(manifest['pages']) > 6:
        raise ValueError('Pilot limit exceeded')
    routes, titles = set(), set()
    for p in manifest['pages']:
        if set(p) != {'route','title','description','sections','faqs','sources'}:
            raise ValueError('Unexpected editorial fields')
        if not re.fullmatch(r'/pdr-oabt/(?:[a-z0-9-]+/)?', p['route']):
            raise ValueError('Invalid pilot route')
        if p['route'] in routes or p['title'] in titles:
            raise ValueError('Duplicate intent or route')
        routes.add(p['route']); titles.add(p['title'])
        if len(p['sections']) < 3 or not p['faqs'] or not p['sources']:
            raise ValueError('Missing content or source')
        for source in p['sources']:
            parsed=urlsplit(source)
            if not (source in ('/','/yontem.html') or parsed.scheme=='https' and parsed.hostname=='dokuman.osym.gov.tr' and not parsed.username):
                raise ValueError('Unexpected source address')
        for section in p['sections']:
            if set(section) - {'heading','paragraphs','table'} or not section.get('paragraphs'):
                raise ValueError('Unexpected section fields')
            table=section.get('table')
            if table and (set(table)!={'headers','rows'} or any(len(row)!=len(table['headers']) for row in table['rows'])):
                raise ValueError('Invalid table')
        for faq in p['faqs']:
            if set(faq)!={'q','a'}: raise ValueError('Unexpected FAQ fields')
    return routes

def render(p, manifest):
    e=html.escape
    def text(value): return e(str(value))
    content='<h1>'+e(p['title'])+'</h1><p>'+e(p['description'])+'</p>'
    for section in p['sections']:
        content+='<section><h2>'+e(section['heading'])+'</h2>'+''.join('<p>'+e(x)+'</p>' for x in section['paragraphs'])
        if section.get('table'):
            table=section['table']
            content+='<div class="table-wrap" tabindex="0" role="region" aria-label="'+e(section['heading'],quote=True)+'"><table><caption>'+e(section['heading'])+'</caption><thead><tr>'+''.join('<th scope="col">'+text(x)+'</th>' for x in table['headers'])+'</tr></thead><tbody>'
            for row in table['rows']:
                content+='<tr><th scope="row">'+text(row[0])+'</th>'+''.join('<td>'+text(x)+'</td>' for x in row[1:])+'</tr>'
            content+='</tbody></table></div>'
        content+='</section>'
    content+='<section><h2>Sık sorulan sorular</h2>'+''.join('<h3>'+e(x['q'])+'</h3><p>'+e(x['a'])+'</p>' for x in p['faqs'])+'</section>'
    content+='<section><h2>Kaynaklar</h2><ul>'+''.join('<li><a href="'+e(url,quote=True)+'">'+ ('ÖSYM kaynak belgesi' if url.startswith('https:') else 'Mevcut yöntem açıklaması' if 'yontem' in url else 'Mevcut PDR Analiz aracı')+'</a></li>' for url in p['sources'])+'</ul></section>'
    content+='<section><h2>İlgili analiz sayfaları</h2><ul>'+''.join('<li><a href="'+e(peer['route'])+'">'+e(peer['title'])+'</a></li>' for peer in manifest['pages'] if peer['route']!=p['route'])+'</ul><p><a href="/">Net girişi ve analiz ekranını aç</a> · <a href="/yontem.html">Yöntem ve veri kapsamı</a></p></section>'
    base=manifest['base_url']
    schemas=[{'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'PDR Analiz','item':base+'/'},{'@type':'ListItem','position':2,'name':p['title'],'item':base+p['route']}]},{'@context':'https://schema.org','@type':'FAQPage','mainEntity':[{'@type':'Question','name':x['q'],'acceptedAnswer':{'@type':'Answer','text':x['a']}} for x in p['faqs']]}]
    schema=json.dumps(schemas,ensure_ascii=False).replace('<','\\u003c')
    return '<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+e(p['title'])+' | PDR Analiz</title><meta name="description" content="'+e(p['description'],quote=True)+'"><meta name="robots" content="noindex,follow"><link rel="canonical" href="'+base+p['route']+'"><script type="application/ld+json">'+schema+'</script><style>body{margin:0;background:#f5f7f8;color:#173c42;font:16px system-ui;line-height:1.75}header,main,footer{max-width:950px;margin:auto;padding:24px}a{color:#137d78}section,aside{padding:20px;background:white;border:1px solid #dde8e7;border-radius:14px;margin:20px 0}h1{line-height:1.25;font-size:clamp(27px,5vw,38px);overflow-wrap:anywhere}h2{font-size:23px}h3{font-size:18px}nav{display:flex;flex-wrap:wrap;gap:18px}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:10px;border-bottom:1px solid #dde8e7}caption{text-align:left;font-weight:700}th{min-width:75px}</style></head><body><header><nav aria-label="PDR Kampüs bağlantıları"><a href="/">PDR Analiz</a><a href="/pdr-oabt/">PDR ÖABT rehberi</a><a href="https://pdrkampus.com/">PDR Kampüs</a><a href="https://norm.pdrkampus.com/">Norm Analizi</a></nav></header><main>'+content+'</main><footer>PDR Kampüs · PDR ÖABT ve AGS analizleri</footer></body></html>'

def audit(p, manifest):
    source=render(p,manifest); page=Page(source)
    checks={'unique_heading':len(page.primary_h1)==1,'canonical':page.canonicals==[manifest['base_url']+p['route']], 'preview_noindex':page.noindex,'readable_content':len(page.main_text.split())>=150,'source_links':bool(p['sources']),'faq_matches_visible':all(x['q'] in source and x['a'] in source for x in p['faqs']),'schema_valid':not page.errors and len(page.schemas)==1,'related_routes':all(peer['route'] in page.links for peer in manifest['pages'] if peer!=p)}
    return {'route':p['route'],'title':p['title'],'checks':checks,'score':round(100*sum(checks.values())/len(checks)),'eligible_for_review':all(checks.values()),'publication':'preview_only'}

def main():
    ap=argparse.ArgumentParser(description=__doc__); ap.add_argument('command',choices=['audit','generate']);ap.add_argument('--dry-run',action='store_true');ap.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1]);ap.add_argument('--output',type=Path,required=True); args=ap.parse_args()
    root=args.root.resolve(); output=safe_output(root,args.output)
    if output.exists(): raise ValueError('Choose a new output directory')
    if args.command=='generate' and not args.dry_run:raise ValueError('Generation requires --dry-run')
    guard=protected(root)
    if not guard['pass']:raise ValueError('Protected files changed')
    manifest=json.loads((root/'seo/analysis-pilot.json').read_text());validate(manifest)
    results=[audit(p,manifest) for p in manifest['pages']]
    if not all(p['eligible_for_review'] for p in results):raise ValueError('Quality gate failed')
    output.mkdir(parents=True)
    if args.command=='generate':
        for p in manifest['pages']:
            target=output/'preview'/p['route'].strip('/')/'index.html';target.parent.mkdir(parents=True);target.write_text(render(p,manifest),encoding='utf-8')
    report={'checked_on':manifest['checked_on'],'application_writes':0,'database_writes':0,'protection':guard,'verification':manifest['verification'],'pages':results,'source_documents':manifest['source_documents'],'limits':['Preview only; live sitemap unchanged.','Scores check structure, not search ranking or guaranteed indexing.','Existing calculations and source datasets unchanged.']}
    (output/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); print(json.dumps({'pages':len(results),'protection':guard['pass'],'report':str(output/'report.json')}))
if __name__=='__main__':main()

(function(){
  'use strict';

  const tests=[
    {key:'sozel',label:'Sözel',max:15},
    {key:'sayisal',label:'Sayısal',max:15},
    {key:'tarih',label:'Tarih',max:6},
    {key:'cografya',label:'Coğrafya',max:6},
    {key:'egitim',label:'Eğitim',max:30},
    {key:'mevzuat',label:'Mevzuat',max:8},
    {key:'oabt',label:'ÖABT',max:50}
  ];

  const text=(id,fallback='--')=>{
    const value=document.getElementById(id)?.textContent?.trim();
    return value||fallback;
  };
  const numberFrom=(value)=>{
    let cleaned=String(value||'').replace(/[^0-9,.-]/g,'');
    if(cleaned.includes(',')) cleaned=cleaned.replace(/\./g,'').replace(',','.');
    else if((cleaned.match(/\./g)||[]).length>1) cleaned=cleaned.replace(/\./g,'');
    const match=cleaned.match(/-?\d+(?:\.\d+)?/);
    return match?Number(match[0]):0;
  };
  const currentNets=()=>{
    if(typeof getUserNets==='function'){
      try{return getUserNets()}catch(e){}
    }
    return Object.fromEntries(tests.map(t=>[t.key,numberFrom(text('net-'+t.key,'0'))]));
  };
  const setText=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value};
  const fmt=(n,d=2)=>Number(n||0).toFixed(d).replace('.',',');

  function userFirstName(){
    const raw=text('user-name','Aday');
    if(!raw||raw==='Kullanıcı')return 'Aday';
    return raw.split(/\s+/)[0];
  }
  function rankingText(){
    const direct=text('result-2026-rank','--');
    return direct==='--'?text('result-rank-range','--'):direct;
  }
  function referenceData(){
    return (typeof P2_RANKING_DATA!=='undefined'&&Array.isArray(P2_RANKING_DATA))?P2_RANKING_DATA:[];
  }
  function referenceAverages(){
    const ds=referenceData();
    if(!ds.length)return null;
    const out={};
    tests.forEach(t=>{
      const vals=ds.map(row=>Number(row?.[t.key])).filter(Number.isFinite);
      if(vals.length)out[t.key]={avg:vals.reduce((a,b)=>a+b,0)/vals.length,count:vals.length};
    });
    return out;
  }
  function renderReferenceComparison(nets,averages){
    const host=document.getElementById('rk-pa-compare-list');
    if(!host)return {largestGapLabel:'--',largestGapValue:0};
    if(!averages){
      host.innerHTML='<p class="rk-pa-empty-note">Gerçek sonuç referansları henüz yüklenmedi.</p>';
      setText('rk-pa-reference-count','VERİ');
      return {largestGapLabel:'--',largestGapValue:0};
    }

    const dsCount=referenceData().length;
    setText('rk-pa-reference-count',dsCount?dsCount+' SONUÇ':'VERİ');

    const rows=tests.filter(t=>averages[t.key]).map(t=>{
      const user=Number(nets[t.key]||0);
      const avg=averages[t.key].avg;
      const diff=user-avg;
      return {...t,user,avg,diff};
    });

    const largest=[...rows].sort((a,b)=>Math.abs(b.diff)-Math.abs(a.diff))[0];
    host.innerHTML=rows.map(r=>{
      const positive=r.diff>=0;
      const width=Math.min(100,Math.abs(r.diff)/(r.max||1)*100);
      return '<div class="rk-pa-compare-row">'
        +'<div class="rk-pa-compare-main"><strong>'+r.label+'</strong><span>Sen <b>'+fmt(r.user)+'</b> · Referans <b>'+fmt(r.avg)+'</b></span></div>'
        +'<div class="rk-pa-compare-diff '+(positive?'is-positive':'is-negative')+'">'+(positive?'+':'')+fmt(r.diff)+'</div>'
        +'<div class="rk-pa-compare-track"><i class="'+(positive?'is-positive':'is-negative')+'" style="width:'+width.toFixed(1)+'%"></i></div>'
        +'</div>';
    }).join('');

    return {
      largestGapLabel:largest?largest.label+' '+(largest.diff>=0?'+':'')+fmt(largest.diff):'--',
      largestGapValue:largest?largest.diff:0
    };
  }

  function updatePersonalDashboard(){
    const root=document.getElementById('rk-personal-dashboard');
    if(!root)return;

    const nets=currentNets();
    const totalAgs=['sozel','sayisal','tarih','cografya','egitim','mevzuat'].reduce((s,k)=>s+Number(nets[k]||0),0);
    const p2=text('result-p2-score','--');
    const rank=rankingText();

    setText('rk-pa-name',userFirstName());
    setText('rk-pa-ags',fmt(totalAgs));
    setText('rk-pa-oabt',fmt(Number(nets.oabt||0)));
    setText('rk-pa-p2',p2);
    setText('rk-pa-rank',rank);
    setText('rk-pa-next-p2',p2);
    setText('rk-pa-next-rank',rank);
    setText('rk-pa-percentile',text('percentile-label','--'));

    const normalized=tests.map(t=>({
      ...t,
      value:Number(nets[t.key]||0),
      ratio:Math.max(0,Math.min(1,Number(nets[t.key]||0)/t.max))
    }));
    const entered=normalized.some(x=>x.value>0);
    const sorted=[...normalized].sort((a,b)=>b.ratio-a.ratio);
    const strongest=sorted[0];
    const priority=sorted[sorted.length-1];
    const avg=entered?normalized.reduce((s,x)=>s+x.ratio,0)/normalized.length:0;

    setText('rk-pa-strongest',entered?strongest.label:'—');
    setText('rk-pa-priority',entered?priority.label:'—');

    const agsRatio=totalAgs/80;
    const oabtRatio=Number(nets.oabt||0)/50;
    const balanceDiff=oabtRatio-agsRatio;
    const balance=Math.abs(balanceDiff)<0.08?'Dengeli':balanceDiff>0?'ÖABT ağırlıklı':'AGS ağırlıklı';
    setText('rk-pa-balance',entered?balance:'—');
    setText('rk-pa-balance-note',entered
      ?(Math.abs(balanceDiff)<0.08?'İki ana bölüm birbirine yakın ilerliyor':balanceDiff>0?'ÖABT oranı AGS toplam oranından yüksek':'AGS toplam oranı ÖABT oranından yüksek')
      :'Mevcut net dağılımına göre');

    const level=entered?(avg>=.7?'Güçlü profil':avg>=.45?'Dengeli profil':'Gelişime açık profil'):'Analiz için veri bekleniyor';
    setText('rk-pa-level',level);

    if(entered){
      setText('rk-pa-story-title',strongest.label+' mevcut profilindeki en güçlü alan.');
      setText('rk-pa-story-copy',
        priority.label+' ise test kapasitesine göre en fazla gelişim alanı bırakıyor. '+balance+' bir AGS–ÖABT görünümün var.');
      setText('rk-pa-strongest-note','Kapasitenin %'+Math.round(strongest.ratio*100)+'\'i');
      setText('rk-pa-priority-note','Kapasitenin %'+Math.round(priority.ratio*100)+'\'i');
      setText('rk-pa-next-copy',priority.label+' alanındaki gelişim potansiyelini aşağıdaki “1 Netin Tahmini P2 Etkisi” bölümünde doğrudan senaryoya çevirebilirsin.');
    }else{
      setText('rk-pa-story-title','Netlerini girdikten sonra profil yorumun burada görünecek.');
      setText('rk-pa-story-copy','Bu alan puan formülünü değiştirmez; yalnızca mevcut sonuçlarını yorumlar.');
      setText('rk-pa-strongest-note','Test kapasitesine göre');
      setText('rk-pa-priority-note','Gelişim potansiyeli en yüksek alan');
      setText('rk-pa-next-copy','Netlerini girdikten sonra öncelikli gelişim alanın burada özetlenecek.');
    }

    const ref=renderReferenceComparison(nets,referenceAverages());
    setText('rk-pa-largest-gap',ref.largestGapLabel);
  }

  function scheduleUpdate(){clearTimeout(scheduleUpdate.t);scheduleUpdate.t=setTimeout(updatePersonalDashboard,220)}
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('#sozel-d,#sozel-y,#sayisal-d,#sayisal-y,#tarih-d,#tarih-y,#cografya-d,#cografya-y,#egitim-d,#egitim-y,#mevzuat-d,#mevzuat-y,#oabt-d,#oabt-y').forEach(el=>el.addEventListener('input',scheduleUpdate));
    ['result-p2-score','result-2026-rank','result-rank-range','percentile-label','user-name'].forEach(id=>{
      const el=document.getElementById(id);if(el)new MutationObserver(scheduleUpdate).observe(el,{childList:true,subtree:true,characterData:true});
    });
    setTimeout(updatePersonalDashboard,450);
    setTimeout(updatePersonalDashboard,1300);
  });
  window.updatePersonalDashboard=updatePersonalDashboard;
})();
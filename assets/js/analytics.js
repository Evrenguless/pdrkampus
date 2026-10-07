(function(){
  const GA_ID='G-1WQ10WJHVW';
  const KEY='pdrkampus_analytics_consent_v1';

  function readConsent(){
    try{return localStorage.getItem(KEY)}catch{return null}
  }
  function writeConsent(value){
    try{localStorage.setItem(KEY,value)}catch{}
  }

  const saved=readConsent();
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
  window.gtag('consent','default',{
    analytics_storage:saved==='granted'?'granted':'denied',
    ad_storage:'denied',
    ad_user_data:'denied',
    ad_personalization:'denied'
  });
  window.gtag('js',new Date());
  window.gtag('config',GA_ID);

  const loader=document.createElement('script');
  loader.async=true;
  loader.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(GA_ID);
  document.head.appendChild(loader);

  function setConsent(granted){
    const value=granted?'granted':'denied';
    writeConsent(value);
    window.gtag('consent','update',{analytics_storage:value});
    document.getElementById('pdr-analytics-consent')?.remove();
  }

  function showBanner(){
    if(readConsent()!==null||document.getElementById('pdr-analytics-consent'))return;
    const style=document.createElement('style');
    style.textContent='#pdr-analytics-consent{position:fixed;z-index:99999;left:16px;right:16px;bottom:16px;max-width:760px;margin:auto;background:#fff;color:#1d2f39;border:1px solid rgba(18,60,49,.18);border-radius:16px;padding:16px 18px;box-shadow:0 18px 60px rgba(0,0,0,.18);font:14px/1.5 system-ui,sans-serif}#pdr-analytics-consent p{margin:0 0 12px}#pdr-analytics-consent div{display:flex;flex-wrap:wrap;gap:8px}#pdr-analytics-consent button{border:1px solid #123c31;border-radius:999px;padding:8px 13px;background:#fff;color:#123c31;font:inherit;font-weight:700;cursor:pointer}#pdr-analytics-consent button[data-accept]{background:#123c31;color:#fff}';
    document.head.appendChild(style);
    const box=document.createElement('section');
    box.id='pdr-analytics-consent';
    box.setAttribute('role','dialog');
    box.setAttribute('aria-label','Analitik tercihi');
    box.innerHTML='<p>PDR Kampüs, site kullanımını toplu olarak ölçmek için Google Analytics kullanabilir. Analitik ölçüm yalnızca izin verirsen etkinleşir.</p><div><button type="button" data-reject>Yalnızca gerekli</button><button type="button" data-accept>Analitiğe izin ver</button></div>';
    box.addEventListener('click',e=>{
      if(e.target.closest('[data-accept]'))setConsent(true);
      if(e.target.closest('[data-reject]'))setConsent(false);
    });
    document.body.appendChild(box);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showBanner,{once:true});
  else showBanner();
})();
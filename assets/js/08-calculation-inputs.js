    // ==========================================
    // 🎛️ FORM & HESAPLAMA MOTORU
    // ==========================================
    // Tek giriş yöntemi: Doğru/Yanlış girilir, net otomatik hesaplanır.
    // Eski mod değiştirme fonksiyonu kayıtlı eski verilerle uyumluluk için pasif tutulur.
    function setInputMode(mode) {
      // Artık kullanıcıya mod seçtirmiyoruz; hesaplama daima D/Y üzerinden yapılır.
      document.querySelectorAll('.dy-group').forEach(el => el.classList.remove('hidden'));
      document.querySelectorAll('.net-group').forEach(el => el.classList.add('hidden'));
      handleInputChange();
    }

    function getUserNets() {
      return {
        sozel: getNetFromDY('sozel-d', 'sozel-y', 15),
        sayisal: getNetFromDY('sayisal-d', 'sayisal-y', 15),
        tarih: getNetFromDY('tarih-d', 'tarih-y', 6),
        cografya: getNetFromDY('cografya-d', 'cografya-y', 6),
        egitim: getNetFromDY('egitim-d', 'egitim-y', 30),
        mevzuat: getNetFromDY('mevzuat-d', 'mevzuat-y', 8),
        oabt: getNetFromDY('oabt-d', 'oabt-y', 50)
      };
    }

    const DY_TEST_LIMITS = {sozel:15,sayisal:15,tarih:6,cografya:6,egitim:30,mevzuat:8,oabt:50};
    const DY_TEST_LABELS = {sozel:'Sözel Yetenek',sayisal:'Sayısal Yetenek',tarih:'Tarih',cografya:'Coğrafya',egitim:'Eğitim',mevzuat:'Mevzuat',oabt:'ÖABT'};
    function validateDYInputs() {
      let notice = document.getElementById('dy-input-notice');
      if (!notice) {
        notice = document.createElement('p');
        notice.id = 'dy-input-notice';
        notice.setAttribute('role','status');
        notice.setAttribute('aria-live','polite');
        notice.style.cssText = 'font-size:12px;line-height:1.6;padding:10px 12px;border:1px solid #d6e2df;border-radius:10px;margin:0 0 12px;color:#536071;background:#f4f9f7';
        const first = document.getElementById('sozel-d').closest('.space-y-2');
        first.before(notice);
      }
      const messages = [];
      for (const [key,maxQ] of Object.entries(DY_TEST_LIMITS)) {
        const dEl = document.getElementById(key+'-d'), yEl = document.getElementById(key+'-y');
        for (const input of [dEl,yEl]) {
          if (input.value !== '') {
            const n = Number(input.value), valid = Math.min(maxQ,Math.max(0,Math.trunc(Number.isFinite(n)?n:0)));
            if (n !== valid) {
              input.value = String(valid);
              messages.push(DY_TEST_LABELS[key]+': 0–'+maxQ+' arasında tam sayı girin. Değer '+valid+' olarak düzeltildi.');
            }
          }
        }
        const d = Number(dEl.value)||0, y = Number(yEl.value)||0;
        if (d+y > maxQ) {
          const edited = document.activeElement === dEl ? dEl : yEl;
          const remaining = maxQ - (edited === dEl ? y : d);
          edited.value = String(remaining);
          messages.push(DY_TEST_LABELS[key]+': doğru + yanlış toplamı '+maxQ+' soruyu aşamaz. '+(edited===dEl?'Doğru':'Yanlış')+' sayısı '+remaining+' olarak düzeltildi.');
        }
      }
      notice.textContent = messages.length ? messages.join(' ') : 'Net = Doğru − Yanlış / 4. Negatif netler korunur; doğru + yanlış toplamı testin soru sayısını aşamaz.';
      notice.style.color = messages.length ? '#a33f2e' : '#536071';
    }
    function getNetFromDY(dId, yId, maxQ) {
      const d = parseFloat(document.getElementById(dId).value) || 0;
      const y = parseFloat(document.getElementById(yId).value) || 0;
      return d - (y / 4);
    }

    function handleInputChange(autoSave = true) {
      validateDYInputs();
      const userNets = getUserNets();

      document.getElementById('net-sozel').innerText = userNets.sozel.toFixed(2);
      document.getElementById('net-sayisal').innerText = userNets.sayisal.toFixed(2);
      document.getElementById('net-tarih').innerText = userNets.tarih.toFixed(2);
      document.getElementById('net-cografya').innerText = userNets.cografya.toFixed(2);
      document.getElementById('net-egitim').innerText = userNets.egitim.toFixed(2);
      document.getElementById('net-mevzuat').innerText = userNets.mevzuat.toFixed(2);
      document.getElementById('net-oabt').innerText = userNets.oabt.toFixed(2) + ' Net';

      const totalAgs = userNets.sozel + userNets.sayisal + userNets.tarih + userNets.cografya + userNets.egitim + userNets.mevzuat;
      document.getElementById('total-ags-net-badge').innerText = totalAgs.toFixed(2) + ' Net';

      if (autoSave) {
        saveInputsLocally();
      }

      clearTimeout(calcDebounceTimer);
      calcDebounceTimer = setTimeout(() => {
        calculateRankingViaServer(userNets);
      }, 150);
    }

    // 2026 P2 VERİ SETİ: yüklenen sonuç belgelerinden, soru sayıları doğrulanmış 119 geçerli adaydan kalibre edilmiştir.
    let P2_RANKING_DATA = [];
    let P2_VALID_RESULT_COUNT = 0;
    let P2_MODEL = null;
    let OFFICIAL_TEST_STATS = {};
    let MARGINAL_TESTS = {};


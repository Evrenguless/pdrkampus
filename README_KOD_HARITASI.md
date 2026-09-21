# PDR Kampüs — Kod Haritası

Bu sürüm, çalışan tek-dosya HTML yapısını davranışı değiştirmeden parçalara ayırır.
Amaç: kodu kolay bulmak, düzenlemek ve GitHub Pages üzerinde aynı şekilde çalıştırmak.

## Ana dosya
- `index.html` — yalnızca sayfa iskeleti/HTML. CSS ve JavaScript dış dosyalara taşındı.

## Kritik JavaScript dosyaları
- `assets/js/02-config.js` — Supabase URL/anon key ve ana global değişkenler.
- `assets/js/04-auth.js` — Google giriş / çıkış / oturum kontrolü. Çalışan Auth akışı burada.
- `assets/js/07-leaderboard.js` — canlı sıralama işlemleri.
- `assets/js/08-calculation-inputs.js` — net girişleri ve giriş değişikliklerinin hesaplamayı tetiklemesi.
- `assets/js/09-site-data.js` — Supabase `pdrkampus_site_datasets` verilerini yükler ve tarihsel/araştırma verilerini ekrana basar.
- `assets/js/10-results-analysis.js` — puan/sıra sonucu, radar, kişisel analiz ve benzer adaylar.
- `assets/js/11-simulator.js` — 2027 senaryo simülasyonu.
- `assets/js/12-init.js` — sayfa açılışında Auth ve veri yükleme başlangıcı.

## Diğer JavaScript dosyaları
- `00-favicon.js` — favicon/logo bağlantısı.
- `01-navigation.js` — sol menü ve sayfa navigasyonu.
- `03-community.js` — topluluk soru panosu.
- `05-chat.js` — canlı sohbet.
- `06-storage.js` — form girdilerinin local/cloud saklanması.
- `13-radar-init.js` — radar grafiği ilk yükleme.
- `14-legal.js` — gizlilik/iletişim/yasal modal içerikleri.
- `15-live-oabt-distribution.js` — canlı ÖABT dağılımı.
- `16-real-result-distribution.js` — gerçek sonuç dağılımı.
- `17-oabt-distribution-fallback.js` — ÖABT dağılımı yedek okuma.
- `18-subtest-distribution.js` — alt test dağılım grafikleri.
- `19-section-navigation.js` — analiz içi bölüm kaydırma.
- `20-historical-charts.js` — aday/kontenjan tarihsel grafikler.
- `21-content-flow.js` — ana analiz bölümlerinin sırası.

## CSS haritası
- `00-logo-asset.css` — logo dosyasını CSS değişkenine bağlar.
- `01-base.css` — temel tema, sidebar, header ve genel yüzeyler.
- `02-layout.css` — ana responsive yerleşim.
- `03-dashboard.css` — dashboard kart sistemi.
- `04-scenario-matrix.css` — senaryo matrisi.
- `05-legacy-brand-layout.css` — önceki marka yerleşim düzeltmeleri.
- `06-brand-logo.css` — logo boyutları.
- `07-logo-alignment.css` — logonun optik hizası.
- `08-subtest-distribution.css` — alt test dağılım kartları.
- `09-analysis-navigation.css` — analiz hedefleri/kaydırma düzeni.
- `10-overview-dashboard.css` — genel bakış ve KPI görünümü.
- `11-content-sections.css` — ana analiz bölüm kabukları.
- `12-footer-brand.css` — footer ve son marka ayarları.

## Görsel
- `assets/img/pdrkampus-logo.png` — daha önce HTML içine base64 gömülü olan logo artık gerçek dosya.

## Dokunmama kuralı
Google Auth, Supabase bağlantısı, hesaplama formülleri ve mevcut sayısal veri akışı bu refactor sırasında değiştirilmedi.
Yeni özellik eklerken önce ilgili dosyada çalışmak, diğer kritik dosyaları gereksiz yere değiştirmemek daha güvenlidir.

## GitHub Pages
Repo kökünde `index.html` ve `assets/` klasörü birlikte bulunmalı:

```text
/
├── index.html
├── README_KOD_HARITASI.md
└── assets/
    ├── css/
    ├── img/
    └── js/
```

`assets/` klasörü eksik yüklenirse stil ve JavaScript çalışmaz.

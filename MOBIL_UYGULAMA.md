# PDRkampüs Mobil Uygulama

Mevcut web arayüzü Capacitor ile Android ve iOS uygulamasında çalışacak şekilde hazırlanmıştır. Hesaplama formülleri, sayısal veriler ve Supabase veri akışı değiştirilmemiştir.

## Android Studio olmadan APK oluşturma

Projede `.github/workflows/android-apk.yml` iş akışı bulunur. Proje GitHub'a gönderildiğinde test APK'sı otomatik hazırlanır.

1. GitHub reposunda **Actions** sekmesini açın.
2. Sol menüden **PDRkampus Android APK** iş akışını seçin.
3. **Run workflow** düğmesine basın.
4. İşlem tamamlanınca sayfanın altındaki **Artifacts** bölümünden `PDRkampus-test-apk` paketini indirin.
5. ZIP dosyasının içindeki `app-debug.apk` dosyasını Android telefona gönderip kurun.

Android, mağaza dışından gelen ilk APK için “Bilinmeyen uygulamalara izin ver” onayı isteyebilir. Bu dosya yalnızca test içindir.

Her `main` veya `master` güncellemesinde de APK otomatik oluşturulur.

## Yerel gereksinimler

- Node.js 20 veya üzeri
- Android Studio (yalnızca bilgisayarda emülatör veya yerel paketleme istenirse)
- macOS + Xcode (iOS paketi için)

## İlk kurulum

```bash
npm install
npm run android:add
npm run android:open
```

Android Studio açıldıktan sonra bir emülatör veya USB ile bağlı cihaz seçilip **Run** düğmesine basılır.

## Sonraki güncellemeler

Web dosyalarında değişiklik yaptıktan sonra:

```bash
npm run android:sync
```

Bu komut güncel `index.html` ve `assets/` klasörünü uygulamaya kopyalar.

## Uygulama görselleri

Mevcut PDRkampüs logosu kullanılarak Android ikonları ve krem zeminli açılış ekranı oluşturulmuştur. Kaynaklar `resources/` klasöründedir. Yeniden üretmek için:

```bash
npm run android:assets
```

## iOS

```bash
npm run ios:add
npm run ios:open
```

## Google giriş notu

Tarayıcıdaki Google girişi mevcut hâliyle korunur. Native uygulamadaki OAuth dönüşü için gerçek alan adı belirlendiğinde Supabase Redirect URLs listesine HTTPS dönüş adresi veya uygulama deep-link adresi eklenmelidir. Domain belli olmadan bu adres kalıcı biçimde tanımlanmamalıdır.

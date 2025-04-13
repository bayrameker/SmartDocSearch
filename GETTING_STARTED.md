# Başlangıç Rehberi

Bu belge, Akıllı Doküman Arama ve Sorgulama Sistemi'ni kurulum ve başlatma konusunda temel bilgiler sağlar.

## Önkoşullar

Sistemi çalıştırmak için aşağıdaki bileşenlerin kurulu olması gerekmektedir:

- Node.js (v18 veya daha yeni)
- PostgreSQL veritabanı
- (İsteğe bağlı) MinIO, Typesense, Qdrant ve Kafka

## Adım Adım Kurulum

### 1. Bağımlılıkları Yükleme

Projenin ana dizininde aşağıdaki komutu çalıştırın:

```bash
npm install
```

Bu komut, tüm gerekli Node.js paketlerini yükleyecektir.

### 2. Çevresel Değişkenleri Yapılandırma

`.env.example` dosyasını kopyalayarak `.env` dosyası oluşturun:

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyerek kendi ortamınıza uygun değerleri ayarlayın. Özellikle aşağıdaki değişkenleri yapılandırmak önemlidir:

- `DATABASE_URL`: PostgreSQL veritabanı bağlantı URL'niz
- `OPENAI_API_KEY`: OpenAI API anahtarınız (yapay zeka özellikleri için gerekli)
- `JWT_SECRET`: JWT token şifreleme anahtarınız (güvenlik için benzersiz ve güçlü bir değer olmalı)

### 3. Veritabanını Başlatma

Veritabanı şemasını oluşturmak için:

```bash
npm run db:push
```

### 4. Servisleri Başlatma

#### Geliştirme Modunda

Tüm servisleri geliştirme modunda başlatmak için:

```bash
npm run dev
```

Bu komut, aşağıdaki servisleri başlatacaktır:
- Frontend Server (http://localhost:5000)
- API Gateway (http://localhost:8000)
- Document Processing Service (http://localhost:8001)
- Ve diğer mikroservisler

#### Üretim Modunda

Uygulamayı üretim için derlemek için:

```bash
npm run build
```

Derlenmiş uygulamayı başlatmak için:

```bash
npm start
```

## Belge Yükleme ve Arama

1. Tarayıcınızda `http://localhost:5000` adresine gidin
2. Kayıt olun veya giriş yapın
3. "Belge Yükle" sayfasından belge yükleyin
4. Belge işlendikten sonra, arama ve sorgulama özelliklerini kullanmaya başlayabilirsiniz

## Sorun Giderme

### Veritabanı Bağlantı Sorunları

- PostgreSQL'in çalıştığından emin olun
- DATABASE_URL değişkeninin doğru olduğunu kontrol edin
- PostgreSQL kullanıcısının gerekli yetkilere sahip olduğunu doğrulayın

### API Gateway Erişim Sorunları

- API Gateway'in çalıştığından emin olun (`npm run api`)
- CORS ayarlarının doğru yapılandırıldığını kontrol edin

### OpenAI API Sorunları

- OPENAI_API_KEY'in doğru olduğunu doğrulayın
- API kotanızı ve kullanım limitlerini kontrol edin
- Ağ bağlantısını kontrol edin

## Ortam Değişimi

Farklı ortamlarda (geliştirme, test, üretim) çalıştırmak için NODE_ENV değişkenini ayarlayabilirsiniz:

```bash
NODE_ENV=production npm start
```

---

Daha fazla bilgi için ana [README.md](README.md) dosyasına bakın veya destek için bir issue açın.
# Akıllı Doküman Arama ve Sorgulama Sistemi

## Proje Tanımı

Akıllı Doküman Arama ve Sorgulama Sistemi, kullanıcıların belgeleri yükleyebildiği, işletebildiği, arayabildiği ve doğal dil ile sorgulayabildiği mikroservis mimarisine sahip bir uygulamadır. Sistem OCR ile metin çıkarma, doküman indeksleme, arama, vektör veritabanına dayalı semantik arama ve RAG (Retrieval Augmented Generation) ile doküman tabanlı AI sorgulaması gibi özelliklere sahiptir.

## Modül ve Servis Yapısı

### 1. Doküman İşleme Servisi (Document Processing Service)

**Kullanılan Teknolojiler:** Bun.js, OCRmyPDF, spaCy/HuggingFace, Apache Kafka

**Sorumlulukları:**
- (-) PDF, DOCX, TXT gibi formatlardan metin çıkarma
- (-) OCR ile taranmış belgelerden metin çıkarma
- (-) Metin ön işleme ve temizleme
- (-) NLP ile anahtar kelime ve varlık çıkarma
- (-) Kafka'ya işlenmiş verileri gönderme

**Dosya Yapısı:**
```
/services/document-processing/
├── index.ts                   # Ana giriş noktası
├── ocr.ts                     # OCR işlevleri
├── text-extraction.ts         # Metin çıkarma işlevleri
├── nlp.ts                     # Doğal dil işleme
├── kafka.ts                   # Kafka entegrasyonu
├── models/                    # Veri modelleri
├── utils/                     # Yardımcı fonksiyonlar
└── test/                      # Birim testleri
```

### 2. Arama ve İndeksleme Servisi (Search Service)

**Kullanılan Teknolojiler:** Bun.js, Typesense, Fastify

**Sorumlulukları:**
- (-) Dokümanları indeksleme
- (-) Tam metin arama özelliği sağlama
- (-) Filtreleme ve sıralama özellikleri
- (-) Sonuçlarda vurgulama (highlighting)
- (-) Otomatik tamamlama (autocomplete)

**Dosya Yapısı:**
```
/services/search/
├── index.ts                   # Ana giriş noktası
├── typesense.ts               # Typesense bağlantısı ve işlemleri
├── indexing.ts                # İndeksleme işlemleri
├── routes.ts                  # API routes
├── models/                    # Veri modelleri
├── utils/                     # Yardımcı fonksiyonlar
└── test/                      # Birim testleri
```

### 3. Doküman Depolama Servisi (Storage Service)

**Kullanılan Teknolojiler:** Bun.js, MinIO, CockroachDB, Drizzle ORM

**Sorumlulukları:**
- (-) Dokümanları MinIO'da depolama
- (-) Metadata bilgilerini CockroachDB'de saklama
- (-) Dosya yükleme, indirme ve silme işlemleri
- (-) Dosya versiyonlama
- (-) Kullanıcı bazlı dosya erişim kontrolü

**Dosya Yapısı:**
```
/services/storage/
├── index.ts                   # Ana giriş noktası
├── minio.ts                   # MinIO entegrasyonu
├── db.ts                      # CockroachDB ve Drizzle ORM konfigürasyonu
├── routes.ts                  # API routes
├── models/                    # Veri modelleri
├── utils/                     # Yardımcı fonksiyonlar
└── test/                      # Birim testleri
```

### 4. Vektör İşleme Servisi (Vector Service)

**Kullanılan Teknolojiler:** Bun.js, Qdrant, OpenAI Embeddings

**Sorumlulukları:**
- (-) Doküman metin parçalarını vektöre dönüştürme
- (-) Vektörleri Qdrant'ta depolama
- (-) Semantik arama yapma
- (-) Vektör benzerlik skorlarını hesaplama
- (-) OpenAI API üzerinden embedding oluşturma

**Dosya Yapısı:**
```
/services/vector/
├── index.ts                   # Ana giriş noktası
├── qdrant.ts                  # Qdrant entegrasyonu
├── embeddings.ts              # OpenAI embeddings oluşturma
├── routes.ts                  # API routes
├── models/                    # Veri modelleri
├── utils/                     # Yardımcı fonksiyonlar
└── test/                      # Birim testleri
```

### 5. API Gateway

**Kullanılan Teknolojiler:** Bun.js, KrakenD, Keycloak

**Sorumlulukları:**
- (-) Tüm servislere tek bir giriş noktası sağlama
- (-) JWT tabanlı kimlik doğrulama
- (-) Yetkilendirme kontrolü
- (-) İstek yönlendirme
- (-) Hız sınırlama ve önbellekleme
- (-) Kullanıcı kaydı ve oturum yönetimi

**Dosya Yapısı:**
```
/services/api-gateway/
├── index.ts                   # Ana giriş noktası
├── routes.ts                  # Yönlendirme yapılandırması
├── auth.ts                    # Kimlik doğrulama işlevleri
├── proxy.ts                   # Proxy işlemleri
├── models/                    # Veri modelleri
├── utils/                     # Yardımcı fonksiyonlar
└── test/                      # Birim testleri
```

### 6. Sorgulama Motoru (Query Engine)

**Kullanılan Teknolojiler:** Bun.js, Haystack, OpenAI API

**Sorumlulukları:**
- (-) Dokümanlardan ilgili parçaları getirme (retrieval)
- (-) Doğal dil soruları işleme
- (-) OpenAI kullanarak RAG cevapları oluşturma
- (-) Kaynak belgelere referans verme
- (-) Sorgulara güvenilir yanıtlar sağlama

**Dosya Yapısı:**
```
/services/query-engine/
├── index.ts                   # Ana giriş noktası
├── retriever.ts               # Belge parçalarını alma işlevi
├── openai.ts                  # OpenAI API entegrasyonu
├── rag.ts                     # RAG implementasyonu
├── routes.ts                  # API routes
├── models/                    # Veri modelleri
├── utils/                     # Yardımcı fonksiyonlar
└── test/                      # Birim testleri
```

### 7. Frontend Uygulaması

**Kullanılan Teknolojiler:** SvelteKit, Chakra UI, Jotai

**Sorumlulukları:**
- (+) Kullanıcı kaydı ve giriş
- (-) Doküman yükleme
- (-) Doküman arama ve listeleme
- (-) AI destekli doküman sorgulama
- (-) Kullanıcı profil yönetimi
- (-) Raporlama ve istatistikler

**Dosya Yapısı:**
```
/frontend/
├── src/
│   ├── lib/                   # Kütüphaneler ve yardımcı işlevler
│   ├── routes/                # Sayfa rotaları
│   │   ├── +page.svelte       # Ana sayfa
│   │   ├── login/             # Giriş sayfası
│   │   ├── register/          # Kayıt sayfası
│   │   ├── documents/         # Doküman yönetimi
│   │   ├── search/            # Arama ekranı
│   │   └── query/             # Sorgulama ekranı
│   ├── components/            # Tekrar kullanılabilir bileşenler
│   ├── stores/                # Jotai state yönetimi
│   ├── styles/                # CSS ve stil dosyaları
│   └── utils/                 # Yardımcı fonksiyonlar
├── static/                    # Statik dosyalar
└── tests/                     # Frontend testleri
```

## Ortak Bileşenler

### Veri Şeması (Shared Schema)

**Kullanılan Teknolojiler:** TypeScript, Drizzle ORM

**Sorumlulukları:**
- (-) Tüm servislerin paylaştığı veri şemalarını tanımlama
- (-) Veritabanı modelleri ve ilişkileri
- (-) Tip tanımlamaları
- (-) Doğrulama şemaları

**Dosya Yapısı:**
```
/shared/
├── schema.ts                  # Veri tabanı şemaları
├── types.ts                   # Ortak tip tanımlamaları
├── validation.ts              # Veri doğrulama şemaları
└── constants.ts               # Ortak sabitler
```

### Konfigürasyon

**Kullanılan Teknolojiler:** TypeScript, dotenv

**Sorumlulukları:**
- (+) Ortam değişkenlerini yapılandırma
- (+) Servis bağlantı bilgilerini yönetme
- (-) Geliştirme, test ve üretim ortamları için farklı konfigürasyonlar

**Dosya Yapısı:**
```
/
├── config.ts                  # Konfigürasyon ayarları
├── .env                       # Ortam değişkenleri
└── .env.example               # Örnek ortam değişkenleri
```

## Yardımcı Hizmetler ve Araçlar

### Veritabanı ve Depolama

- (+) **CockroachDB:** Metadata ve ilişkisel verileri saklamak için
- (-) **MinIO:** Dokümanların kendilerini depolamak için
- (-) **Qdrant:** Vektör veritabanı
- (-) **Typesense:** Tam metin arama indeksi

### İletişim ve Entegrasyon

- (-) **gRPC:** Servisler arası iletişim
- (-) **Apache Kafka:** Olay tabanlı mimari ve mesaj kuyruğu
- (-) **WebSocket:** Gerçek zamanlı bildirimler

## Geliştirme ve Dağıtım Araçları

- (+) **Git:** Sürüm kontrolü
- (-) **Docker:** Konteynırlaştırma
- (-) **Docker Compose:** Geliştirme ortamı
- (-) **GitHub Actions:** CI/CD
- (-) **Prometheus & Grafana:** İzleme

## Geliştirme Planı ve Öncelikler

### Aşama 1: Temel Altyapı ve Konfigürasyon

1. (+) Proje yapısını oluşturma
2. (+) Gerekli paketleri belirleme ve kurma
3. (+) Ortak şema ve tipleri tanımlama
4. (+) Konfigürasyon ayarlarını yapılandırma
5. (+) Temel veritabanı şemasını oluşturma
6. (+) API Gateway altyapısını kurma

### Aşama 2: Temel İşlevsellik 

7. (+) Kullanıcı kimlik doğrulama sistemini oluşturma
8. (-) Doküman yükleme ve depolama işlevini ekleme
9. (-) OCR ve metin çıkarma işlevselliğini ekleme
10. (-) Temel doküman arama özelliğini ekleme
11. (-) Basit kullanıcı arayüzünü oluşturma

### Aşama 3: Gelişmiş Özellikler

12. (-) Vektör temelli semantik arama ekleme
13. (-) OpenAI API entegrasyonu
14. (-) RAG işlevselliğini ekleme
15. (-) Doküman işleme süreç hatlarını iyileştirme
16. (-) Doğal dil sorgularını işleme yeteneği ekleme

### Aşama 4: Optimizasyon ve Ölçeklendirme

17. (-) Performans optimizasyonları
18. (-) Kullanıcı arayüzü iyileştirmeleri
19. (-) Hata işleme ve dayanıklılık
20. (-) Yetkilendirme ve erişim kontrolü iyileştirmeleri
21. (-) İzleme ve günlük kaydı eklentileri
22. (-) Dokümantasyon ve öğreticiler

## Tamamlanan İşler ve İlerleme Durumu

### Tamamlanan İşler

- (+) Temel proje yapısı oluşturuldu
- (+) Kullanıcı kaydı ve giriş işlevselliği eklendi
- (+) API Gateway temel altyapısı kuruldu

### Devam Eden İşler

- (-) Doküman yükleme ve depolama işlevi
- (-) OCR ve metin çıkarma işlevselliği
- (-) Temel doküman arama özelliği

### Planlanan İşler

- (-) Semantik arama
- (-) RAG sorgulaması
- (-) Gelişmiş arayüz özellikleri

## Notlar ve Kararlar

- Frontend için Chakra UI yerine yerel CSS kullanımı tercih edildi
- Veri bütünlüğü için Drizzle ORM'in sağladığı ilişkiler kullanılıyor
- Servisler arasında yüksek performans için gRPC tercih edildi
- Güvenli dosya erişimi için JWT tabanlı geçici URL'ler oluşturuluyor
- Tüm sunucular CORS'a dikkat edilerek yapılandırılıyor
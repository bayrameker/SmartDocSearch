# Akıllı Doküman Arama ve Sorgulama Sistemi

Bu proje, yapay zeka destekli belge arama ve sorgulama platformu sunan, mikroservis mimarisi kullanan gelişmiş bir uygulamadır. Kullanıcılar sisteme belgeler yükleyebilir, metin madenciliği ve yapay zeka teknolojileri ile gelişmiş arama ve soru-cevap yetenekleri kullanabilirler.

## 🌟 Özellikler

- **Belge Yükleme ve İşleme**: PDF, TXT, DOCX ve diğer belge formatlarını destekler
- **Otomatik OCR**: Taranmış belgeleri ve imajları otomatik olarak metne dönüştürür
- **Semantik Arama**: Anlam tabanlı arama ile ilgili belgeleri hızlıca bulun
- **Yapay Zeka Sorguları**: Belgelerinizin içeriğine dayalı karmaşık sorular sorun
- **Çoklu Dil Desteği**: Türkçe ve İngilizce dahil birden fazla dil desteği
- **Güvenli Erişim Kontrolü**: Rol bazlı yetkilendirme sistemi

## 🏗️ Mimari

Bu sistem aşağıdaki mikroservisleri içeren modüler bir yapıya sahiptir:

- **API Gateway**: Tüm istemci isteklerini karşılar ve ilgili servislere yönlendirir
- **Document Processing**: Belge işleme, metin çıkarma ve OCR
- **Search Service**: Tam metin arama ve indeksleme
- **Storage Service**: Belge depolama ve metadata yönetimi
- **Vector Service**: Belge vektör embeddinglari ve semantik arama
- **Query Engine**: Doğal dil sorguları ve yapay zeka yanıtları

## 🚀 Teknoloji Yığını

- **Backend**: Node.js, Fastify, gRPC
- **Frontend**: SvelteKit
- **Veritabanı**: PostgreSQL, Drizzle ORM
- **Arama Motorları**: Typesense (metin arama), Qdrant (vektör arama)
- **Mesajlaşma**: Apache Kafka
- **Depolama**: MinIO (S3 uyumlu nesne depolama)
- **AI/ML**: OpenAI (embeddings, soru-cevap)

## 🛠️ Kurulum

### Gereksinimler

- Node.js 18+
- PostgreSQL
- MinIO (isteğe bağlı, dosya depolama için)
- Apache Kafka (isteğe bağlı, asenkron iletişim için)
- Typesense (isteğe bağlı, tam metin arama için)
- Qdrant (isteğe bağlı, vektör arama için)
- OpenAI API anahtarı (yapay zeka işlevleri için)

### Başlangıç

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/kullaniciadi/akilli-dokuman-arama.git
   cd akilli-dokuman-arama
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. `.env` dosyasını yapılandırın (örnek için `.env.example` dosyasını kopyalayın)

4. Veritabanını başlatın:
   ```bash
   npm run db:push
   ```

5. Uygulamayı başlatın:
   ```bash
   npm run dev
   ```

Uygulama varsayılan olarak `http://localhost:5000` adresinde çalışacaktır.

## 📊 Çevresel Değişkenler

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| DATABASE_URL | PostgreSQL veritabanı bağlantı URL'si | postgresql://user:password@localhost:5432/docusearch |
| OPENAI_API_KEY | OpenAI API anahtarı | - |
| FRONTEND_PORT | Frontend servisinin portu | 5000 |
| SERVER_PORT | API Gateway portu | 8000 |
| JWT_SECRET | JWT token şifreleme anahtarı | your-secret-key |

## 📝 API Dokümantasyonu

Temel API endpointleri:

- `POST /auth/register` - Yeni kullanıcı kaydı
- `POST /auth/login` - Kullanıcı girişi
- `GET /documents` - Belge listesi
- `POST /documents/upload` - Yeni belge yükleme
- `GET /documents/:id` - Belge detayları
- `POST /search` - Belgelerde arama yapma
- `POST /query` - Belgelere doğal dil ile soru sorma

## 👨‍💻 Geliştirme

Yeni özellikleri eklerken veya mevcut kodu değiştirirken, lütfen aşağıdaki adımları izleyin:

1. Yeni bir branch oluşturun
2. Değişikliklerinizi yapın ve test edin
3. Test süitlerini çalıştırın: `npm test`
4. Değişikliklerinizi commit edin
5. Pull request oluşturun

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen katkıda bulunmadan önce katkı kurallarımızı okuyun.

## 📜 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

## 🙏 Teşekkürler

- [OpenAI](https://openai.com) - Yapay zeka modelleri için
- [Svelte](https://svelte.dev) - Reaktif UI kütüphanesi
- [Fastify](https://fastify.io) - Hızlı web framework
- [PostgreSQL](https://postgresql.org) - Güvenilir ilişkisel veritabanı

---

© 2025 Akıllı Doküman Arama ve Sorgulama Sistemi
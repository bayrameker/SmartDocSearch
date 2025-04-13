# Akıllı Doküman Arama ve Sorgulama Sistemi (AI Destekli)

## 1. Servis Mimarisi ve Bileşenler

### 1.1 Doküman İşleme Servisi
- **Görev**: Dokümanları işleme, metin çıkarma, OCR, metin analizi
- **Teknolojiler**: 
  - Bun.js (Runtime)
  - OCRmyPDF (PDF işleme ve OCR)
  - spaCy/HuggingFace (NLP)
  - Apache Kafka (Mesaj kuyruklama)
- **API Endpointleri**:
  - `POST /process`: Doküman işleme isteği
  - `GET /status/:id`: İşleme durumu kontrolü

### 1.2 Arama ve İndeksleme Servisi
- **Görev**: Dokümanları indeksleme, tam metin arama, filtreleme
- **Teknolojiler**:
  - Typesense (Arama motoru)
  - Fastify (API)
- **API Endpointleri**:
  - `POST /index`: Doküman indeksleme
  - `GET /search`: Arama sorgusu
  - `DELETE /index/:id`: İndeks silme

### 1.3 Doküman Depolama Servisi
- **Görev**: Dokümanları depolama, metadata yönetimi
- **Teknolojiler**:
  - MinIO (Nesne depolama)
  - CockroachDB (Metadata veritabanı)
  - Drizzle ORM (Veritabanı ORM)
- **API Endpointleri**:
  - `POST /documents`: Doküman yükleme
  - `GET /documents/:id`: Doküman indirme
  - `GET /documents`: Doküman listesi
  - `DELETE /documents/:id`: Doküman silme

### 1.4 Vektör İşleme Servisi
- **Görev**: Metin embeddingi oluşturma, vektör veritabanı yönetimi
- **Teknolojiler**:
  - Qdrant (Vektör veritabanı)
  - OpenAI Embeddings API
- **API Endpointleri**:
  - `POST /vectors`: Vektör oluşturma ve kaydetme
  - `GET /vectors/search`: Benzer vektörleri arama
  - `DELETE /vectors/:id`: Vektör silme

### 1.5 API Gateway
- **Görev**: API rotaları, kimlik doğrulama, yetkilendirme
- **Teknolojiler**:
  - KrakenD (API Gateway)
  - Keycloak (Kimlik yönetimi)
  - JWT (Token tabanlı kimlik doğrulama)
- **API Endpointleri**:
  - Tüm servislere yönlendirme
  - `/auth`: Kimlik doğrulama işlemleri

### 1.6 Sorgulama Motoru (RAG)
- **Görev**: Doküman sorgulama, soru cevaplama
- **Teknolojiler**:
  - Haystack (RAG Framework)
  - OpenAI API (LLM modeli)
- **API Endpointleri**:
  - `POST /query`: Soru sorma
  - `GET /query/history`: Sorgu geçmişi

### 1.7 Frontend Uygulaması
- **Görev**: Kullanıcı arayüzü
- **Teknolojiler**:
  - SvelteKit (Frontend framework)
  - Chakra UI (UI bileşenleri)
  - Jotai (Durum yönetimi)
- **Sayfalar**:
  - Giriş/Kayıt
  - Doküman yükleme
  - Doküman yönetimi
  - Arama
  - Sorgulama

## 2. Dosya Yapısı

```
/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── routes/
│   │   │   ├── +page.svelte
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── documents/
│   │   │   ├── search/
│   │   │   └── query/
│   │   └── app.html
│   ├── static/
│   └── vite.config.js
├── services/
│   ├── document-processing/
│   │   ├── index.ts
│   │   ├── ocr.ts
│   │   ├── nlp.ts
│   │   └── kafka.ts
│   ├── search/
│   │   ├── index.ts
│   │   └── typesense.ts
│   ├── storage/
│   │   ├── index.ts
│   │   ├── minio.ts
│   │   └── db.ts
│   ├── vector/
│   │   ├── index.ts
│   │   ├── embeddings.ts
│   │   └── qdrant.ts
│   ├── api-gateway/
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   └── auth.ts
│   └── query-engine/
│       ├── index.ts
│       ├── haystack.ts
│       └── openai.ts
├── shared/
│   ├── schema.ts
│   └── types.ts
├── main.ts
└── config.ts
```

## 3. Veritabanı Şemaları

### 3.1 CockroachDB (Metadata)

```typescript
// users tablosu
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// documents tablosu
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  filename: varchar('filename', { length: 200 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSize: integer('file_size').notNull(),
  storageKey: varchar('storage_key', { length: 200 }).notNull(),
  typesenseId: varchar('typesense_id', { length: 100 }),
  qdrantCollection: varchar('qdrant_collection', { length: 100 }),
  status: varchar('status', { length: 50 }).notNull().default('processing'),
  textContent: text('text_content'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// document_chunks tablosu
export const documentChunks = pgTable('document_chunks', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => documents.id).notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  vectorId: varchar('vector_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// queries tablosu
export const queries = pgTable('queries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  query: text('query').notNull(),
  answer: text('answer'),
  documentIds: integer('document_ids').array(),
  intent: varchar('intent', { length: 100 }),
  entities: jsonb('entities'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### 3.2 Typesense (Arama İndeksi)

```json
{
  "name": "documents",
  "fields": [
    {"name": "id", "type": "string"},
    {"name": "user_id", "type": "int32"},
    {"name": "title", "type": "string"},
    {"name": "content", "type": "string"},
    {"name": "filename", "type": "string"},
    {"name": "mime_type", "type": "string"},
    {"name": "created_at", "type": "int64"},
    {"name": "metadata", "type": "object"}
  ],
  "default_sorting_field": "created_at"
}
```

### 3.3 Qdrant (Vektör Veritabanı)

```typescript
// Doküman koleksiyonu oluşturma
async function createDocumentCollection() {
  await qdrantClient.createCollection('documents', {
    vectors: {
      size: 1536,  // OpenAI embedding boyutu
      distance: 'Cosine'
    },
    sparse_vectors: {},
    shard_number: 1,
    replication_factor: 1,
    write_consistency_factor: 1,
    on_disk_payload: true
  });
}
```

## 4. Servisler Arası İletişim

### 4.1 gRPC Servis Tanımlamaları

```protobuf
// document_processing.proto
service DocumentProcessingService {
  rpc ProcessDocument(ProcessDocumentRequest) returns (ProcessDocumentResponse);
  rpc GetProcessingStatus(StatusRequest) returns (StatusResponse);
}

// vector_service.proto
service VectorService {
  rpc GenerateEmbeddings(EmbeddingRequest) returns (EmbeddingResponse);
  rpc SearchSimilarVectors(SearchRequest) returns (SearchResponse);
}

// query_engine.proto
service QueryEngineService {
  rpc QueryDocuments(QueryRequest) returns (QueryResponse);
}
```

### 4.2 Kafka Topikleri

- `document-uploaded`: Yeni doküman yüklendiğinde
- `document-processed`: Doküman işlendiğinde
- `document-indexed`: Doküman indekslendiğinde
- `document-embedding-created`: Doküman vektörleri oluşturulduğunda
- `document-deleted`: Doküman silindiğinde

## 5. Güvenlik ve Erişim Kontrolü

### 5.1 JWT Yapısı

```typescript
interface JwtPayload {
  sub: string;       // Kullanıcı ID
  username: string;  // Kullanıcı adı
  email: string;     // E-posta
  roles: string[];   // Roller
  iat: number;       // Oluşturulma zamanı
  exp: number;       // Sona erme zamanı
}
```

### 5.2 API Güvenlik Katmanı

```typescript
// JWT doğrulama middleware'i
function verifyJwt(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

## 6. Geliştirme Planı ve Öncelikler

### 6.1 Temel Altyapı Geliştirme (1. Aşama)

1. **Temel proje yapısını oluşturma**
   - Dosya yapısı kurulumu
   - Paket bağımlılıklarının belirlenmesi
   - Yapılandırma dosyalarının oluşturulması

2. **Veritabanı ve depolama**
   - CockroachDB şema oluşturma
   - Drizzle ORM entegrasyonu
   - MinIO bağlantısı

3. **Frontend iskelet yapısı**
   - SvelteKit kurulumu
   - Temel sayfalar ve bileşenlerin oluşturulması
   - Chakra UI entegrasyonu

### 6.2 Temel Özellikler (2. Aşama)

4. **Kimlik doğrulama ve yetkilendirme**
   - Kullanıcı kaydı ve girişi
   - JWT tabanlı kimlik doğrulama
   - Keycloak entegrasyonu

5. **Doküman yükleme ve depolama**
   - Dosya yükleme arayüzü
   - MinIO entegrasyonu
   - Metadata yönetimi

6. **Basit doküman görüntüleme**
   - Doküman listesi
   - Doküman detay sayfası
   - İndirme işlevselliği

### 6.3 Temel Arama ve İşleme (3. Aşama)

7. **Doküman işleme**
   - OCR entegrasyonu
   - Metin çıkarma
   - İşleme kuyruğu

8. **Arama fonksiyonu**
   - Typesense entegrasyonu
   - Temel arama arayüzü
   - Sonuç gösterimi

9. **Vektör veritabanı**
   - Qdrant kurulumu
   - OpenAI embeddings entegrasyonu
   - Vektör depolama mantığı

### 6.4 AI Özellikleri (4. Aşama)

10. **RAG sistemi**
    - Haystack entegrasyonu
    - OpenAI API bağlantısı
    - Soru sorma arayüzü

11. **Metin analizi**
    - NLP işlemleri
    - Varlık çıkarma
    - Özet oluşturma

12. **Semantik arama**
    - Vektör tabanlı arama
    - Benzerlik sorgulama
    - Gelişmiş filtreleme

### 6.5 Gelişmiş Özellikler (5. Aşama)

13. **Gerçek zamanlı bildirimler**
    - WebSocket entegrasyonu
    - İşlem durumu güncellemeleri
    - Bildirim sistemi

14. **API Gateway entegrasyonu**
    - KrakenD kurulumu
    - Servis yönlendirme
    - Hız sınırlaması

15. **Analitikler ve raporlama**
    - Kullanım istatistikleri
    - Sorgu analitikleri
    - Performans izleme

## 7. Gerekli Paketler

### 7.1 Backend Paketleri

```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.5.0",
    "drizzle-orm": "^0.27.0",
    "fastify": "^4.17.0",
    "ws": "^8.13.0",
    "openai": "^4.16.0",
    "typesense": "^1.7.1",
    "minio": "^7.1.1",
    "qdrant-js": "^1.3.0",
    "haystack-ai": "^0.0.1",
    "@grpc/grpc-js": "^1.9.0",
    "@grpc/proto-loader": "^0.7.8",
    "kafkajs": "^2.2.4",
    "jsonwebtoken": "^9.0.1",
    "bcrypt": "^5.1.0",
    "undici": "^5.22.1",
    "elysia": "^0.7.15",
    "langchain": "^0.0.102"
  },
  "devDependencies": {
    "typescript": "^5.1.6",
    "bun-types": "^1.0.1",
    "drizzle-kit": "^0.19.12"
  }
}
```

### 7.2 Frontend Paketleri

```json
{
  "dependencies": {
    "@sveltejs/kit": "^1.20.4",
    "svelte": "^4.0.5",
    "@chakra-ui/svelte": "^2.1.0",
    "jotai": "^2.2.2",
    "jwt-decode": "^3.1.2",
    "chart.js": "^4.3.0",
    "svelte-markdown": "^0.2.3",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "vite": "^4.4.2",
    "svelte-check": "^3.4.6",
    "typescript": "^5.1.6",
    "@sveltejs/adapter-node": "^1.3.1"
  }
}
```

## 8. Dağıtım Stratejisi

### 8.1 Docker Compose Yapılandırması

```yaml
version: '3.8'

services:
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "8000:8000"
    depends_on:
      - document-processing
      - search
      - storage
      - vector
      - query-engine
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}

  document-processing:
    build: ./services/document-processing
    environment:
      - KAFKA_BROKERS=${KAFKA_BROKERS}
      - OCR_LANGUAGE=${OCR_LANGUAGE}

  search:
    build: ./services/search
    environment:
      - TYPESENSE_HOST=${TYPESENSE_HOST}
      - TYPESENSE_API_KEY=${TYPESENSE_API_KEY}

  storage:
    build: ./services/storage
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - MINIO_ENDPOINT=${MINIO_ENDPOINT}
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}

  vector:
    build: ./services/vector
    environment:
      - QDRANT_URL=${QDRANT_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}

  query-engine:
    build: ./services/query-engine
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=${DATABASE_URL}

  frontend:
    build: ./frontend
    ports:
      - "5000:5000"
    environment:
      - API_GATEWAY_URL=http://api-gateway:8000

  # External services
  cockroachdb:
    image: cockroachdb/cockroach
    command: start-single-node --insecure
    ports:
      - "26257:26257"
      - "8080:8080"
    volumes:
      - cockroach-data:/cockroach/cockroach-data

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=${MINIO_ACCESS_KEY}
      - MINIO_ROOT_PASSWORD=${MINIO_SECRET_KEY}
    volumes:
      - minio-data:/data

  typesense:
    image: typesense/typesense
    ports:
      - "8108:8108"
    environment:
      - TYPESENSE_API_KEY=${TYPESENSE_API_KEY}
      - TYPESENSE_DATA_DIR=/data
    volumes:
      - typesense-data:/data

  qdrant:
    image: qdrant/qdrant
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant-data:/qdrant/storage

  kafka:
    image: confluentinc/cp-kafka
    ports:
      - "9092:9092"
    environment:
      - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092
      - KAFKA_AUTO_CREATE_TOPICS_ENABLE=true
      - KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
    volumes:
      - kafka-data:/var/lib/kafka/data

volumes:
  cockroach-data:
  minio-data:
  typesense-data:
  qdrant-data:
  kafka-data:
```

### 8.2 Sürekli Entegrasyon / Sürekli Dağıtım (CI/CD)

- GitHub Actions veya GitLab CI kullanılacak
- Otomatik test çalıştırma
- Otomatik Docker imajı oluşturma
- Otomatik dağıtım (Kubernetes veya Docker Swarm)

## 9. İzleme ve Analitik

### 9.1 İzleme Araçları
- Prometheus (metrik toplama)
- Grafana (görselleştirme)
- Jaeger (dağıtık izleme)

### 9.2 Log Yönetimi
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Fluentd (log toplama)

## 10. Ölçeklenebilirlik Stratejisi

### 10.1 Yatay Ölçeklendirme
- Stateless servislerin çoklu kopyaları
- Yük dengeleyici kullanımı

### 10.2 Veritabanı Ölçeklendirme
- CockroachDB'nin dağıtık yapısından yararlanma
- Okuma replika kullanımı

### 10.3 Önbellek Stratejisi
- Redis kullanımı
- Sorgu sonuçlarının önbelleğe alınması
- Sık kullanılan dokümanların önbelleğe alınması

## 11. İleriki Aşama Geliştirme Fikirleri

- **Çoklu Dil Desteği**: Farklı dillerde OCR ve soru-cevap
- **Görüntü Analizi**: Görsel içerikleri de analiz etme
- **Otomatik Etiketleme**: AI tabanlı doküman etiketleme
- **İlgili Doküman Önerileri**: Benzer dokümanları önerme
- **Doküman Versiyonlama**: Değişiklikleri takip etme
- **İzin Tabanlı Paylaşım**: Hassas dokümanlar için gelişmiş izinler
- **Mobil Uygulama**: Native mobil deneyim
- **Voice-to-Text Sorgulama**: Sesli komutlarla sorgulama

## 12. Test Stratejisi

### 12.1 Birim Testleri

```typescript
// Örnek: Doküman işleme servisi testi
describe('Document Processing Service', () => {
  test('should extract text from PDF', async () => {
    const result = await processDocument('test-document.pdf');
    expect(result.text).toBeDefined();
    expect(result.text.length).toBeGreaterThan(0);
  });
});
```

### 12.2 Entegrasyon Testleri

```typescript
// Örnek: Doküman yükleme ve işleme entegrasyon testi
describe('Document Upload and Processing', () => {
  test('uploaded document should be processed and indexed', async () => {
    // Doküman yükle
    const { documentId } = await uploadDocument(testFile);
    
    // İşleme tamamlanana kadar bekle
    await waitForProcessing(documentId);
    
    // Doküman bilgilerini al
    const document = await getDocument(documentId);
    
    // Dokümanın işlendiğini doğrula
    expect(document.status).toBe('indexed');
    expect(document.typesenseId).toBeDefined();
    expect(document.qdrantCollection).toBeDefined();
  });
});
```

### 12.3 End-to-End Testleri

```typescript
// Örnek: Doküman yükleme ve sorgulama end-to-end testi
describe('Document Upload and Query E2E', () => {
  test('should be able to query an uploaded document', async () => {
    // Kullanıcı girişi
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Doküman yükleme
    await page.goto('/documents/upload');
    await page.setInputFiles('[data-testid="file-input"]', 'test-document.pdf');
    await page.fill('[data-testid="title-input"]', 'Test Document');
    await page.click('[data-testid="upload-button"]');
    
    // Doküman işlenene kadar bekle
    await page.waitForSelector('[data-testid="status-indexed"]');
    
    // Dokümanı sorgula
    await page.goto('/query');
    await page.fill('[data-testid="query-input"]', 'What is the main topic of the document?');
    await page.click('[data-testid="query-button"]');
    
    // Cevabı bekle ve doğrula
    const answerText = await page.textContent('[data-testid="query-answer"]');
    expect(answerText).toBeTruthy();
  });
});
```
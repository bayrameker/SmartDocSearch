# Intelligent Document Search and Query System

This project is an advanced application using microservice architecture to provide an AI-powered document search and query platform. Users can upload documents to the system and utilize text mining and artificial intelligence technologies for advanced search and question-answering capabilities.

## 🌟 Features 2

- **Document Upload and Processing**: Supports PDF, TXT, DOCX, and other document formats
- **Automatic OCR**: Automatically converts scanned documents and images to text
- **Semantic Search**: Quickly find relevant documents with meaning-based search
- **AI Queries**: Ask complex questions based on the content of your documents
- **Multi-language Support**: Support for multiple languages including Turkish and English
- **Secure Access Control**: Role-based authorization system

## 🏗️ Architecture 2

This system has a modular structure that includes the following microservices:

- **API Gateway**: Receives all client requests and routes them to relevant services
- **Document Processing**: Document processing, text extraction, and OCR
- **Search Service**: Full-text search and indexing
- **Storage Service**: Document storage and metadata management
- **Vector Service**: Document vector embeddings and semantic search
- **Query Engine**: Natural language queries and AI responses

## 🚀 Technology Stack 2

- **Backend**: Node.js, Fastify, gRPC
- **Frontend**: SvelteKit
- **Database**: PostgreSQL, Drizzle ORM
- **Search Engines**: Typesense (text search), Qdrant (vector search)
- **Messaging**: Apache Kafka
- **Storage**: MinIO (S3-compatible object storage)
- **AI/ML**: OpenAI (embeddings, question-answering)

## 🛠️ Installation 2

### Requirements

- Node.js 18+
- PostgreSQL
- MinIO (optional, for file storage)
- Apache Kafka (optional, for asynchronous communication)
- Typesense (optional, for full-text search)
- Qdrant (optional, for vector search)
- OpenAI API key (for AI functionality)

### Getting Started

1. Clone the project:
   ```bash
   git clone https://github.com/username/intelligent-document-search.git
   cd intelligent-document-search
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the `.env` file (copy `.env.example` for reference)

4. Initialize the database:
   ```bash
   npm run db:push
   ```

5. Start the application:
   ```bash
   npm run dev
   ```

The application will be running at `http://localhost:5000` by default.

## 📊 Environmental Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL database connection URL | postgresql://user:password@localhost:5432/docusearch |
| OPENAI_API_KEY | OpenAI API key | - |
| FRONTEND_PORT | Frontend service port | 5000 |
| SERVER_PORT | API Gateway port | 8000 |
| JWT_SECRET | JWT token encryption key | your-secret-key |

## 📝 API Documentation

Core API endpoints:

- `POST /auth/register` - New user registration
- `POST /auth/login` - User login
- `GET /documents` - Document list
- `POST /documents/upload` - Upload new document
- `GET /documents/:id` - Document details
- `POST /search` - Search within documents
- `POST /query` - Ask questions in natural language about documents

## 👨‍💻 Development

When adding new features or modifying existing code, please follow these steps:

1. Create a new branch
2. Make and test your changes
3. Run test suites: `npm test`
4. Commit your changes
5. Create a pull request

## 🤝 Contributing

Contributions are welcome! Please read our contribution guidelines before contributing.

## 📜 License

This project is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgements

- [OpenAI](https://openai.com) - For AI models
- [Svelte](https://svelte.dev) - Reactive UI library
- [Fastify](https://fastify.io) - Fast web framework
- [PostgreSQL](https://postgresql.org) - Reliable relational database

---

© 2025 Intelligent Document Search and Query System

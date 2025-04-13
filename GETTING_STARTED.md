# Getting Started Guide

This document provides basic information on setting up and starting the Intelligent Document Search and Query System.

## Prerequisites

The following components must be installed to run the system:

- Node.js (v18 or newer)
- PostgreSQL database
- (Optional) MinIO, Typesense, Qdrant, and Kafka

## Step-by-Step Setup

### 1. Installing Dependencies

Run the following command in the project's main directory:

```bash
npm install
```

This command will install all the necessary Node.js packages.

### 2. Configuring Environment Variables

Create an `.env` file by copying `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file to set values appropriate for your environment. It's particularly important to configure the following variables:

- `DATABASE_URL`: Your PostgreSQL database connection URL
- `OPENAI_API_KEY`: Your OpenAI API key (required for AI features)
- `JWT_SECRET`: Your JWT token encryption key (should be a unique and strong value for security)

### 3. Initializing the Database

To create the database schema:

```bash
npm run db:push
```

### 4. Starting Services

#### In Development Mode

To start all services in development mode:

```bash
npm run dev
```

This command will start the following services:
- Frontend Server (http://localhost:5000)
- API Gateway (http://localhost:8000)
- Document Processing Service (http://localhost:8001)
- And other microservices

#### In Production Mode

To build the application for production:

```bash
npm run build
```

To start the compiled application:

```bash
npm start
```

## Document Upload and Search

1. Go to `http://localhost:5000` in your browser
2. Register or log in
3. Upload a document from the "Upload Document" page
4. After the document is processed, you can start using the search and query features

## Troubleshooting

### Database Connection Issues

- Make sure PostgreSQL is running
- Check that the DATABASE_URL variable is correct
- Verify that the PostgreSQL user has the necessary permissions

### API Gateway Access Issues

- Make sure the API Gateway is running (`npm run api`)
- Check that CORS settings are configured correctly

### OpenAI API Issues

- Verify that OPENAI_API_KEY is correct
- Check your API quota and usage limits
- Check network connectivity

## Environment Switching

You can set the NODE_ENV variable to run in different environments (development, test, production):

```bash
NODE_ENV=production npm start
```

---

For more information, see the main [README.md](README.md) file or open an issue for support.
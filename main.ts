import { existsSync, mkdirSync } from 'fs';
import { API_GATEWAY_URL, DOCUMENT_PROCESSING_URL, SEARCH_SERVICE_URL, STORAGE_SERVICE_URL, VECTOR_SERVICE_URL, QUERY_ENGINE_URL } from './config';

console.log('🚀 Starting Akıllı Doküman Arama ve Sorgulama Sistemi...');

// Create necessary directories if they don't exist
const dirs = ['logs', 'temp', 'uploads'];
dirs.forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(`📁 Created ${dir} directory`);
  }
});

// Import and start all services
async function startServices() {
  try {
    // Start API Gateway
    const apiGateway = await import('./services/api-gateway/index.js');
    console.log(`🔀 API Gateway available at ${API_GATEWAY_URL}`);

    // Start Document Processing Service
    const documentProcessing = await import('./services/document-processing/index.js');
    console.log(`📄 Document Processing Service available at ${DOCUMENT_PROCESSING_URL}`);

    // Start Search Service
    const searchService = await import('./services/search/index.js');
    console.log(`🔍 Search Service available at ${SEARCH_SERVICE_URL}`);

    // Start Storage Service
    const storageService = await import('./services/storage/index.js');
    console.log(`💾 Storage Service available at ${STORAGE_SERVICE_URL}`);

    // Start Vector Service
    const vectorService = await import('./services/vector/index.js');
    console.log(`🧠 Vector Service available at ${VECTOR_SERVICE_URL}`);

    // Start Query Engine Service
    const queryEngineService = await import('./services/query-engine/index.js');
    console.log(`❓ Query Engine Service available at ${QUERY_ENGINE_URL}`);

    console.log('✅ All services started successfully!');
    console.log('📊 System is now operational and ready to accept requests.');
  } catch (error) {
    console.error('❌ Error starting services:', error);
    process.exit(1);
  }
}

startServices().catch(err => {
  console.error('🔥 Fatal error starting the application:', err);
  process.exit(1);
});
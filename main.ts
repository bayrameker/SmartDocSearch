// Main entrypoint for the project
// This file starts all microservices or allows running them individually

import { spawn } from 'child_process';
import { HOST, SERVER_PORT, FRONTEND_PORT } from './config';

// Service configs with file paths and ports
const services = [
  { name: 'document-processing', path: './services/document-processing/index.ts', port: 8001 },
  { name: 'search', path: './services/search/index.ts', port: 8002 },
  { name: 'storage', path: './services/storage/index.ts', port: 8003 },
  { name: 'vector', path: './services/vector/index.ts', port: 8004 },
  { name: 'query-engine', path: './services/query-engine/index.ts', port: 8005 },
  { name: 'api-gateway', path: './services/api-gateway/index.ts', port: SERVER_PORT },
  { name: 'frontend', command: 'cd frontend && npm run dev', port: FRONTEND_PORT }
];

// Handle command line arguments
const args = process.argv.slice(2);
const servicesToRun = args.length > 0 
  ? services.filter(s => args.includes(s.name) || args.includes('all'))
  : [services.find(s => s.name === 'api-gateway')]; // Default to API gateway only

// Log startup
console.log('🚀 Starting services:', servicesToRun.map(s => s.name).join(', '));

// Start each service
servicesToRun.forEach(service => {
  const command = service.command || `bun ${service.path}`;
  
  console.log(`Starting ${service.name} service: ${command}`);
  
  const child = spawn(command, {
    shell: true,
    env: {
      ...process.env,
      SERVER_PORT: service.port.toString(),
      HOST
    }
  });
  
  // Handle output
  child.stdout.on('data', (data) => {
    console.log(`[${service.name}] ${data.toString().trim()}`);
  });
  
  child.stderr.on('data', (data) => {
    console.error(`[${service.name}] ${data.toString().trim()}`);
  });
  
  // Handle service exit
  child.on('close', (code) => {
    console.log(`${service.name} service exited with code ${code}`);
  });
  
  // Handle errors
  child.on('error', (err) => {
    console.error(`Error starting ${service.name} service:`, err);
  });
});

// Handle process shutdown
process.on('SIGINT', () => {
  console.log('Shutting down all services...');
  process.exit(0);
});

console.log(`
🔗 Service URLs:
- API Gateway: http://${HOST}:${SERVER_PORT}
- Frontend: http://${HOST}:${FRONTEND_PORT}
`);

import { Kafka } from 'kafkajs';
import { KAFKA_BROKERS } from '../../config';

// Initialize Kafka client
const kafka = new Kafka({
  clientId: 'document-processing-service',
  brokers: KAFKA_BROKERS,
});

// Create producer
const producer = kafka.producer();

/**
 * Initialize Kafka connection
 */
async function initializeKafka() {
  try {
    await producer.connect();
    console.log('Connected to Kafka');
  } catch (error) {
    console.error('Failed to connect to Kafka:', error);
    throw error;
  }
}

// Call initialize when the module loads
initializeKafka().catch(error => {
  console.error('Kafka initialization failed:', error);
  process.exit(1);
});

/**
 * Send a message to a Kafka topic
 * 
 * @param topic The Kafka topic to publish to
 * @param message The message to publish
 */
export async function sendToKafka(topic: string, message: any) {
  try {
    await producer.send({
      topic,
      messages: [
        { 
          value: JSON.stringify(message),
          timestamp: Date.now().toString(),
        },
      ],
    });
    
    console.log(`Message sent to topic ${topic}`);
    
  } catch (error) {
    console.error(`Failed to send message to Kafka topic ${topic}:`, error);
    throw new Error(`Kafka message publishing failed: ${error.message}`);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing Kafka producer');
  await producer.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing Kafka producer');
  await producer.disconnect();
  process.exit(0);
});

import { Kafka } from 'kafkajs';
import { KAFKA_BROKERS } from '../../config';

// Create Kafka client
const kafka = new Kafka({
  clientId: 'document-processing-service',
  brokers: KAFKA_BROKERS
});

// Create producer
const producer = kafka.producer();

/**
 * Initialize Kafka connection
 */
export async function initializeKafka() {
  try {
    console.log('Connecting to Kafka...');
    await producer.connect();
    console.log('Connected to Kafka successfully');
  } catch (error) {
    console.error('Failed to connect to Kafka:', error);
    throw error;
  }
}

/**
 * Send a message to a Kafka topic
 * 
 * @param topic The Kafka topic to publish to
 * @param message The message to publish
 */
export async function sendToKafka(topic: string, message: any) {
  try {
    // Reconnect to Kafka if needed (Producer doesn't have isConnected property)
    try {
      await producer.connect();
    } catch (e) {
      // Already connected, this is fine
    }
    
    await producer.send({
      topic,
      messages: [
        { 
          value: JSON.stringify(message),
          timestamp: Date.now().toString()
        },
      ],
    });
    
    console.log(`Message sent to topic ${topic}`);
  } catch (error) {
    console.error(`Error sending message to topic ${topic}:`, error);
    throw error;
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing Kafka producer');
  await producer.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing Kafka producer');
  await producer.disconnect();
  process.exit(0);
});
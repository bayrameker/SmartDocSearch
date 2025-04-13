const { Kafka } = require('kafkajs');
const { KAFKA_BROKERS } = require('../../config');

// Kafka client
const kafka = new Kafka({
  clientId: 'document-processing-service',
  brokers: KAFKA_BROKERS,
});

// Kafka producer
let producer;

// Kafka consumer
let consumer;

// Initialize Kafka
async function initializeKafka() {
  try {
    // Create producer
    producer = kafka.producer();
    await producer.connect();
    console.log('Kafka producer connected');

    // Create consumer
    consumer = kafka.consumer({ groupId: 'document-processing-group' });
    await consumer.connect();
    console.log('Kafka consumer connected');

    // Subscribe to topics
    await consumer.subscribe({ topic: 'document-uploaded', fromBeginning: true });
    console.log('Subscribed to document-uploaded topic');

    return { producer, consumer };
  } catch (error) {
    console.error('Error initializing Kafka:', error);
    throw error;
  }
}

/**
 * Send a message to a Kafka topic
 * 
 * @param topic Kafka topic
 * @param message Message to send
 * @returns Send result
 */
async function sendToKafka(topic, message) {
  try {
    if (!producer) {
      throw new Error('Kafka producer not initialized');
    }

    const result = await producer.send({
      topic,
      messages: [
        { 
          value: JSON.stringify(message),
          timestamp: Date.now().toString(),
        },
      ],
    });

    console.log(`Message sent to topic ${topic}:`, result);
    return result;
  } catch (error) {
    console.error(`Error sending message to topic ${topic}:`, error);
    throw error;
  }
}

/**
 * Start Kafka consumer with message handler
 * 
 * @param messageHandler Function to handle incoming messages
 */
async function startConsumer(messageHandler) {
  try {
    if (!consumer) {
      throw new Error('Kafka consumer not initialized');
    }

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (!message.value) {
            console.warn('Received message with no value');
            return;
          }

          const value = JSON.parse(message.value.toString());
          console.log(`Received message from topic ${topic}:`, value);
          
          await messageHandler(value);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      },
    });

    console.log('Kafka consumer started');
  } catch (error) {
    console.error('Error starting Kafka consumer:', error);
    throw error;
  }
}

/**
 * Disconnect from Kafka
 */
async function disconnectKafka() {
  try {
    if (producer) {
      await producer.disconnect();
      console.log('Kafka producer disconnected');
    }
    
    if (consumer) {
      await consumer.disconnect();
      console.log('Kafka consumer disconnected');
    }
  } catch (error) {
    console.error('Error disconnecting from Kafka:', error);
    throw error;
  }
}

// Handle process termination
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down Kafka connections');
  await disconnectKafka();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down Kafka connections');
  await disconnectKafka();
  process.exit(0);
});

module.exports = {
  initializeKafka,
  sendToKafka,
  startConsumer,
  disconnectKafka
};
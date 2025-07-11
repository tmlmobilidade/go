/* * */

import 'dotenv/config'; // get variable from .env file
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { validations } from '@tmlmobilidade/interfaces';
import { MongoClient } from 'mongodb';

/* * */

// Configuration
const CONFIG = {
  RUN_INTERVAL: 86400000, // 24 hours
  DAYS: 30,
  MONGO_URI: process.env.TML_INTERFACE_PLANS || 'mongodb://root:root@localhost:37005/?directConnection=true'
};

/* * */

// MongoDB Connection 
async function connectToMongo() {
  const client = new MongoClient(CONFIG.MONGO_URI);
  try {
    await client.connect(); // connect to mongodb
    LOGGER.info('Successfully connected to MongoDB');
    return client;
  } catch (err) {
    LOGGER.error('MongoDB connection failed:', err);
    process.exit(1);
  }
}

/* * */
// Funtion to clean old plans

async function cleanOldValidations() {
  let mongoClient: MongoClient | null = null;
  
  try {

    LOGGER.init();
    const globalTimer = new TIMETRACKER();

    //  Connect to MongoDB
    mongoClient = await connectToMongo();
    const db = mongoClient.db();
    const validationsCollection = db.collection('validations'); // Get validations collection

    //Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CONFIG.DAYS);

    // Find old validations
    const oldValidations = await validationsCollection.find({

      created_at: { $lt: cutoffDate.getTime() } 

    }).toArray();

    LOGGER.info(`Found ${oldValidations.length} validations older than ${CONFIG.DAYS} days`);

    // Process deletions
    if (oldValidations.length > 0) {

      const deleteTimer = new TIMETRACKER();

      const deleteResult = await validationsCollection.deleteMany({
        _id: { $in: oldValidations.map(v => v._id) }
      });

      LOGGER.info(`Deleted ${deleteResult.deletedCount} old validations. (${deleteTimer.get()})`);
    } else {
      LOGGER.info('No old validations found to clean');
    }

    LOGGER.terminate(`Cleanup completed in ${globalTimer.get()}`);

  } catch (err) {

    LOGGER.error('Cleanup failed:', err);
  } finally {

    if (mongoClient) await mongoClient.close();
  }
}

/* * */

// Startup
(async () => {

  LOGGER.info(`Configuration: ${CONFIG.DAYS} days retention`);

  // Immediate run then schedule
  await cleanOldValidations();
  setInterval(cleanOldValidations, CONFIG.RUN_INTERVAL);
})();
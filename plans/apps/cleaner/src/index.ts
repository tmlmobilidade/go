/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { plans } from '@tmlmobilidade/interfaces'; 

/* * */

const RUN_INTERVAL = 86400000; // 24 hours - adjust as needed
const MAX_AGE_DAYS = 30; // Delete plans older than 30 days

/* * */

async function cleanOldPlans() {
  try {
    LOGGER.init();

    const globalTimer = new TIMETRACKER();

    // Calculate the cutoff date (current date minus MAX_AGE_DAYS)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_AGE_DAYS);

    // Fetch plans older than the cutoff date
    const fetchTimer = new TIMETRACKER();
    
    const oldPlans = await plans.findMany({ 
      created_at: { $lt: cutoffDate } 
    });
    
    const fetchTimerResult = fetchTimer.get();
    LOGGER.info(`Found ${oldPlans.length} plans older than ${MAX_AGE_DAYS} days. (${fetchTimerResult})`);

    if (oldPlans.length > 0) {
      // Delete files from OCI storage
      const deleteStorageTimer = new TIMETRACKER();
      let storageDeleteCount = 0;
      
      // Assuming each plan has a file reference in a 'file_path' field
      for (const plan of oldPlans) {
        if (plan.file_path) {
          try {
            await Storage.deleteObject(plan.file_path);
            storageDeleteCount++;
          } catch (err) {
            LOGGER.warn(`Failed to delete file ${plan.file_path}: ${err.message}`);
          }
        }
      }
      
      LOGGER.info(`Deleted ${storageDeleteCount} files from storage. (${deleteStorageTimer.get()})`);

      // Delete plans from MongoDB
      const deleteDbTimer = new TIMETRACKER();
      const planIds = oldPlans.map(plan => plan._id);
      
      const plansCollection = await plans.getCollection();
      const deleteResult = await plansCollection.deleteMany({ 
        _id: { $in: planIds } 
      });
      
      LOGGER.info(`Deleted ${deleteResult.deletedCount} plans from database. (${deleteDbTimer.get()})`);
    } else {
      LOGGER.info('No old plans to clean.');
    }

    LOGGER.terminate(`Cleanup took ${globalTimer.get()}.`);
  } catch (err) {
    LOGGER.error('An error occurred during plan cleanup:', err);
    LOGGER.error('Retrying in 10 seconds...');
    setTimeout(() => {
      process.exit(0); // End process
    }, 10000); // after 10 seconds
  }
}

/* * */

(async function init() {
  // Initial delay to allow other services to start
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  const runOnInterval = async () => {
    await cleanOldPlans();
    setTimeout(runOnInterval, RUN_INTERVAL);
  };
  
  // Run immediately and then on interval
  runOnInterval();
})();
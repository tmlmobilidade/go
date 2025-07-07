/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { plans } from '@tmlmobilidade/interfaces';
import { OCIStorageClient } from 'bsda'; // Your actual OCI client

/* * */

const RUN_INTERVAL = 86400000; // 24 hours

/* * */

async function cleanOldPlans() {
    try {
        //

        LOGGER.init();

        const globalTimer = new TIMETRACKER();

        //
        // Calculate cutoff date (30 days ago)

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);

        //
        // Get all plans older than cutoff date

        const fetchTimer = new TIMETRACKER();

        const oldPlans = await plans.findMany({ 
            created_at: { $lt: cutoffDate } as any // Type assertion if needed
        });

        const fetchTimerResult = fetchTimer.get();

        LOGGER.info(`Found ${oldPlans.length} plans older than 30 days. (${fetchTimerResult})`);

        //
        // Initialize OCI client

     const storage = new OCIStorageClient({
            accessKeyId: '31fce674ca17a4e58e21aa38051367b62ed67a79', // Your actual key
            secretAccessKey: 'o31k/sf7BNFDNa03OF5L1SfH2FUoghw5m98j0j0WsVk=', // Your actual secret
            region: 'eu-frankfurt-1',
            namespace: 'frdvdrigd38a'
        });

        //
        // Process deletions

        if (oldPlans.length > 0) {
            //

            const deleteTimer = new TIMETRACKER();
            let deletedCount = 0;

               for (const plan of oldPlans) {
                try {
                    // Type-safe check for file_path
                    const filePath = (plan as any).file_path || (plan as unknown as { file_path?: string }).file_path;
                    
                    if (filePath) {
                        await storage.deleteObject({
                            bucketName: 'tml-sae-development',
                            objectName: filePath
                        });
                    }

                    // Delete from MongoDB
                    await (await plans.getCollection()).deleteOne({ _id: plan._id });
                    deletedCount++;

                } catch (err) {
                    LOGGER.error(`Error cleaning plan ${plan._id}`, err as Error);
                }
            }


            LOGGER.info(`Deleted ${deletedCount} old plans. (${deleteTimer.get()})`);
            LOGGER.spacer(1);

            //
        } else {
            LOGGER.info(`No old plans found to clean!`);
            LOGGER.spacer(1);
        }

        //

        LOGGER.terminate(`Cleanup took ${globalTimer.get()}.`);

        //
    } catch (err) {
        LOGGER.error('An error occurred. Halting execution.', err as Error);
        LOGGER.error('Retrying in 10 seconds...');
        setTimeout(() => {
            process.exit(0); // End process
        }, 10000); // after 10 seconds
    }

    //
}

/* * */

(async function init() {
    const runOnInterval = async () => {
        await cleanOldPlans();
        setTimeout(runOnInterval, RUN_INTERVAL);
    };
    runOnInterval();
})();
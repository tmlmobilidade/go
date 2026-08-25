// /* * */

// import { categorizeValidations } from '@/tasks/categorize-validations.js';
// import { linkRefundsToSalesToValidations } from '@/tasks/link-refunds.js';
// import { linkSalesToValidations } from '@/tasks/link-sales.js';
// import { runOnInterval } from '@tmlmobilidade/go-utils-exec';

// /* * */

// const main = async () => {
// 	// The order matters. Start with the least expensive task
// 	// and end with the most expensive one.
// 	await linkRefundsToSalesToValidations();
// 	await linkSalesToValidations();
// 	await categorizeValidations();
// };

// await runOnInterval(main, 60_000);

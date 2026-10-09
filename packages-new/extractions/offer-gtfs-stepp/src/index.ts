/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';

/* * */

export async function main() {
	console.info('Running operation-gtfs-stepp');
}

await runOnInterval(main, { intervalMs: 1000 });

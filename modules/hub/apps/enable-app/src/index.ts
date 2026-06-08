/* * */

import { apiCache } from '@tmlmobilidade/databases';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export async function main() {
	//

	const value = true;

	Logger.title(`Setting app navegante to ${value}...`);

	await apiCache.set('hub:navegante:app-enabled', value.toString());

	Logger.success(`Finished setting app navegante to ${value}`);

	//
};

await main();

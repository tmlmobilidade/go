/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';

/* * */

export async function removeDisabledNetworks(agencyIds: string[]) {
	const enabled = new Set(agencyIds);
	const keys = await cacheDb.scan('hub:v1:*:network:*');
	const disabledKeys = keys.filter((key) => {
		const match = /^hub:v1:(.+):network:/.exec(key);
		return match && !enabled.has(match[1]);
	});
	await cacheDb.deleteMany(disabledKeys);
}

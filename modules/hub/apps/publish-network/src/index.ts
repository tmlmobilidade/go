/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { buildNetwork } from './tasks/build-network.js';
import { publishNetwork } from './tasks/publish-network.js';
import { removeDisabledNetworks } from './tasks/remove-disabled-networks.js';
import { type Network } from './types/network.js';
import { mergeNetworks } from './utils/merge-networks.js';
import { readCachedNetwork } from './utils/read-cached-network.js';

/* * */

async function main() {
	//
	// Initialize the logger

	Logger.init();
	Logger.title('Publishing network data...');

	const globalTimer = new Timer();
	const currentDate = Dates.now('Europe/Lisbon').operational_date_int;

	//
	// Get a set of agency IDs where open data is enabled in an organization

	const organizations = await goDb.core.organizations.findMany({ 'agency_ids.0': { $exists: true }, 'open_data.enabled': true });
	const agencyIds = Array.from(new Set(organizations.flatMap(organization => organization.agency_ids))).sort();
	const networks: Network[] = [];

	for (const agencyId of agencyIds) {
		Logger.title(`Publishing network for agency ${agencyId}...`);

		let network: Network;
		try {
			network = await buildNetwork(agencyId, currentDate);
		} catch (error) {
			Logger.error({ error, message: `Error building network for agency ${agencyId}. Keeping the last successful network.` });
			networks.push(await readCachedNetwork(agencyId));
			continue;
		}

		await publishNetwork(network, agencyId);
		networks.push(network);
	}

	//
	// Keep global feeds available for existing consumers.

	await publishNetwork(mergeNetworks(networks));
	await removeDisabledNetworks(agencyIds);

	Logger.terminate(`Publish network data completed in ${globalTimer.get()}`);
}

/* * */

await runOnInterval(main, { intervalMs: '10m', throwOnError: false });

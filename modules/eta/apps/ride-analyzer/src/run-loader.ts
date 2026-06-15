/* * */

import type { ClickHouseClient } from '@clickhouse/client';
import type { AppConfig } from '@tmlmobilidade/go-eta-pckg-loader';

import { qualifiedTable } from '@tmlmobilidade/go-eta-pckg-common';
import { loadEta } from '@tmlmobilidade/go-eta-pckg-loader';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

/**
 * Runs the standard ETA loader pipeline and then forces a synchronous refresh
 * of mv_pred_node_etas so the replay loop has predicted node travel times to
 * read against (the MV refreshes every 3 minutes by default and would
 * otherwise fire shortly after the loader-created views are committed).
 */
export async function runLoaderPhase(clickhouseClient: ClickHouseClient, config: AppConfig) {
	const timer = new Timer();

	Logger.title('Phase 1: Running ETA loader pipeline');
	await loadEta(config);

	const predNodeEtasMv = qualifiedTable(config.database, 'mv_pred_node_etas');

	Logger.info(`Refreshing ${predNodeEtasMv}`);
	await clickhouseClient.command({ query: `SYSTEM REFRESH VIEW ${predNodeEtasMv}` });
	await clickhouseClient.command({ query: `SYSTEM WAIT VIEW ${predNodeEtasMv}` });

	Logger.success(`Loader phase completed in ${timer.get()} seconds`);
}

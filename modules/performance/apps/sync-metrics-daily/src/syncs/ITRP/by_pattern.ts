/* * */

import { performanceSqlPath } from '@/lib/sql-path.js';
import { buildItrpOriginDestinationLookup } from '@/process/build-itrp-origin-destination-lookup.js';
import { buildItrpRidesLookup } from '@/process/build-itrp-rides-lookup.js';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { validateOperationalDate } from '@tmlmobilidade/types';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

interface ItrpBaseRow {
	agency_id: string
	classificacao: string
	line_id: string
	passageiros_1: number
	passageiros_2: number
	passageiros_3: number
	passageiros_CD: number
	passageiros_N: number
	passageiros_PPM: number
	passageiros_PPT: number
	passengers: number
	pattern_id: string
	sentido: string
	subtipo: string
	tipo_transporte: string
}

/* * */

const METRIC = 'itrp_by_pattern';

export const syncItrpByPattern = async () => {
	Logger.title('Sync ITRP by Pattern');
	const globalTimer = new Timer();

	const dates = {
		end: validateOperationalDate('20251231'),
		start: validateOperationalDate('20250101'),
	};

	Logger.info({ message: `Date range: ${dates.start} to ${dates.end}` });

	//
	// 1. Bootstrap table schema

	Logger.info({ message: 'Running ITRP.sql DDL' });
	await labDb.queryEachStatementFromFile(performanceSqlPath('demand/ITRP/ITRP.sql'));

	//
	// 2. Fetch base pattern rows from ClickHouse (agency_id, pattern_id, line_id, passengers)

	const fetchTimer = new Timer();
	Logger.info({ message: 'Fetching ITRP base patterns from ClickHouse...' });
	const baseRows = await labDb.queryFromFile<ItrpBaseRow>(performanceSqlPath('demand/ITRP/select-itrp-base.sql'));
	Logger.info({ message: `Fetched ${baseRows.length} ITRP base rows (${fetchTimer.get()})` });

	//
	// 3. Load lookups from MongoDB (join key: pattern_id)

	const patternIds = [...new Set(baseRows.map(row => row.pattern_id))];
	const ridesLookup = await buildItrpRidesLookup(patternIds, dates);
	const originDestinationLookup = await buildItrpOriginDestinationLookup(patternIds);

	//
	// 4. Join and insert enriched rows into ClickHouse

	const writer = new BatchWriter({
		batch_size: 10_000,
		insertFn: async (data) => {
			await labDb.queryFromString(`INSERT INTO ${METRIC} JSONEachRow ${JSON.stringify(data)}`);
		},
		title: METRIC,
	});

	let joinedRows = 0;
	let skippedRows = 0;

	for (const row of baseRows) {
		const metrics = ridesLookup.get(row.pattern_id);

		if (!metrics) {
			skippedRows++;
			continue;
		}

		const originDestination = originDestinationLookup.get(row.pattern_id);

		const extensionScheduled = metrics.extension_scheduled_km;
		const extensionObserved = metrics.extension_scheduled_km;
		const circulationsScheduled = metrics.circulations_scheduled;
		const circulationsObserved = metrics.circulations_observed;
		const byDayType = metrics.by_day_type;
		const byPeriod = metrics.by_period;

		joinedRows++;
		await writer.write({
			agency_id: row.agency_id,
			carreiras_servicos_1: byDayType['1'].carreiras_servicos,
			carreiras_servicos_2: byDayType['2'].carreiras_servicos,
			carreiras_servicos_3: byDayType['3'].carreiras_servicos,
			carreiras_servicos_CD: byPeriod.CD.carreiras_servicos,
			carreiras_servicos_N: byPeriod.N.carreiras_servicos,
			carreiras_servicos_PPM: byPeriod.PPM.carreiras_servicos,
			carreiras_servicos_PPT: byPeriod.PPT.carreiras_servicos,
			circulations_observed: circulationsObserved,
			circulations_scheduled: circulationsScheduled,
			classificacao: row.classificacao ?? '',
			designacao: originDestination?.designacao ?? '',
			destino_dtcc: originDestination?.destino_dtcc ?? '',
			destino_municipio: originDestination?.destino_municipio ?? '',
			extension_observed: extensionObserved,
			extension_scheduled: extensionScheduled,
			line_id: row.line_id,
			origem_dtcc: originDestination?.origem_dtcc ?? '',
			origem_municipio: originDestination?.origem_municipio ?? '',
			passageiros_1: Number(row.passageiros_1 ?? 0),
			passageiros_2: Number(row.passageiros_2 ?? 0),
			passageiros_3: Number(row.passageiros_3 ?? 0),
			passageiros_CD: Number(row.passageiros_CD ?? 0),
			passageiros_N: Number(row.passageiros_N ?? 0),
			passageiros_PPM: Number(row.passageiros_PPM ?? 0),
			passageiros_PPT: Number(row.passageiros_PPT ?? 0),
			passengers: Number(row.passengers ?? 0),
			pattern_id: row.pattern_id,
			route_id: metrics.route_id,
			sentido: row.sentido ?? '',
			subtipo: row.subtipo ?? '',
			tipo_transporte: row.tipo_transporte ?? '',
			veiculos_km_1: byDayType['1'].veiculos_km,
			veiculos_km_2: byDayType['2'].veiculos_km,
			veiculos_km_3: byDayType['3'].veiculos_km,
			veiculos_km_CD: byPeriod.CD.veiculos_km,
			veiculos_km_N: byPeriod.N.veiculos_km,
			veiculos_km_PPM: byPeriod.PPM.veiculos_km,
			veiculos_km_PPT: byPeriod.PPT.veiculos_km,
			veiculos_km_previsto: circulationsScheduled * extensionScheduled,
			veiculos_km_produzido: circulationsObserved * extensionObserved,
		});
	}

	await writer.flush();

	if (skippedRows > 0) {
		Logger.info({ message: `Skipped ${skippedRows} rows without rides metrics for pattern_id` });
	}

	logMetricToFile({
		approach: {
			description: 'ClickHouse ITRP base + MongoDB rides/hashed_trips/stops/municipalities join by pattern_id',
			key: 'clickhouse_mongo_join',
		},
		metric: METRIC,
		queryCount: 5,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Inserted ${joinedRows} ITRP rows (${globalTimer.get()})`);
};

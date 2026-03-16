/* * */

import { parseCsv, readGtfsFile } from '@/helpers/index.js';
import { GtfsTMLAfetacao } from '@tmlmobilidade/types';

export async function loadAfectacao(gtfsPath: string) {
	const content = await readGtfsFile(gtfsPath, 'afetacao.csv');
	return parseCsv<GtfsTMLAfetacao>(content);
}

export function buildAfectacaoMaps(afetacaoRows: GtfsTMLAfetacao[]) {
	const zonesByPatternStop = new Map<string, string[]>();
	const zonesByStop = new Map<string, string[]>();
	const interchangeByLineId = new Map<string, string>();
	const mergeZones = (existing: string[] | undefined, codes: string[]) => {
		const merged = new Set(existing ?? []);
		for (const code of codes) merged.add(code);
		return [...merged];
	};

	for (const row of afetacaoRows) {
		if (row.line_id !== null && row.line_id !== undefined && row.interchange !== null && row.interchange !== undefined) {
			const lineId = String(row.line_id).trim();
			const interchange = String(row.interchange).trim();
			if (lineId && interchange) {
				interchangeByLineId.set(lineId, interchange);
			}
		}
		if (!row.accepted_zone_codes || !row.stop_id) continue;
		const codes = row.accepted_zone_codes.split('|').map(code => code.trim()).filter(Boolean);
		if (!codes.length) continue;
		const stopId = row.stop_id.trim();
		if (row.pattern_id) {
			const key = `${row.pattern_id.trim()}:${stopId}`;
			zonesByPatternStop.set(key, mergeZones(zonesByPatternStop.get(key), codes));
		}
		zonesByStop.set(stopId, mergeZones(zonesByStop.get(stopId), codes));
	}

	return { interchangeByLineId, zonesByPatternStop, zonesByStop };
}

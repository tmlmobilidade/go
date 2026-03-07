import { type OriginalPatternDetailType, type OriginalPatternType } from '@/original-pattern.type.js';
import { Dates } from '@tmlmobilidade/dates';
import { patterns } from '@tmlmobilidade/interfaces';
import { generateRandomString } from '@tmlmobilidade/strings';
import { type Pattern, PatternSchema } from '@tmlmobilidade/types';

/* -----------------------------------------------------------------------------------------------
 * Config
 * --------------------------------------------------------------------------------------------- */

const GO_BASE_URL = process.env.GO_BASE_URL ?? 'https://go.carrismetropolitana.pt/api';

const LOCAL_LINES_BASE_URL = process.env.LOCAL_LINES_BASE_URL ?? 'http://localhost:52010';
const LOCAL_STOPS_BASE_URL = process.env.LOCAL_STOPS_BASE_URL ?? 'http://localhost:52003';
const LOCAL_ZONES_BASE_URL = process.env.LOCAL_ZONES_BASE_URL ?? 'http://localhost:52009';

const GO_AUTH_COOKIE = process.env.GO_AUTH_COOKIE;

const MAX_LINES = undefined;
const MAX_PATTERNS = undefined;

const LOG_MISSING_STOPS = String(process.env.SEED_LOG_MISSING_STOPS ?? '1') === '1';
const LOG_MISSING_STOPS_LIMIT = Number(process.env.SEED_LOG_MISSING_STOPS_LIMIT ?? 20);

const FETCH_TIMEOUT_MS = Number(process.env.SEED_FETCH_TIMEOUT_MS ?? 30_000);
const LINE_DETAIL_CONCURRENCY = Number(process.env.SEED_LINE_DETAIL_CONCURRENCY ?? 6);

/* -----------------------------------------------------------------------------------------------
 * Types
 * --------------------------------------------------------------------------------------------- */

type Id = string;
type Code = string;

interface WithIdAndCode {
	_id: Id
	code: Code
}

interface ApiList<T> {
	data: T[]
}

interface ApiEnvelope<T> {
	data: T
	error: unknown
	statusCode: number
}

interface LocalStop {
	_id: Id
	legacy_id: null | string
}

interface LocalLineListItem {
	_id: Id
	code: Code
}

interface LocalLineDetailRoute {
	_id: Id
	code: Code
	name?: string
}

interface LocalLineDetail {
	_id: Id
	code: Code
	routes?: LocalLineDetailRoute[]
}

/* -----------------------------------------------------------------------------------------------
 * HTTP helpers
 * --------------------------------------------------------------------------------------------- */

async function fetchJson<T>(url: string, opts: RequestInit = {}, timeoutMs = FETCH_TIMEOUT_MS): Promise<T> {
	const controller = new AbortController();
	const t = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const res = await fetch(url, { ...opts, signal: controller.signal });
		const text = await res.text();

		if (!res.ok) {
			throw new Error(`${res.status} ${res.statusText} for ${url} | body=${text.slice(0, 300)}`);
		}

		try {
			return JSON.parse(text) as T;
		}
		catch {
			throw new Error(`Failed to parse JSON from ${url} | body=${text.slice(0, 300)}`);
		}
	}
	finally {
		clearTimeout(t);
	}
}

/** GO endpoints may return `[...]`, others `{ data: [...] }` */
function pickArrayOrData<T>(payload: unknown, label: string): T[] {
	if (Array.isArray(payload)) return payload as T[];
	if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
		return (payload as { data: T[] }).data as T[];
	}
	throw new Error(`Unexpected ${label} response shape: expected array or { data: array }`);
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
	const results: R[] = new Array(items.length);
	let idx = 0;

	const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (idx < items.length) {
			const i = idx++;
			results[i] = await fn(items[i], i);
		}
	});

	await Promise.all(workers);
	return results;
}

/* -----------------------------------------------------------------------------------------------
 * Main
 * --------------------------------------------------------------------------------------------- */

export async function seedPatternsFromGoV1() {
	if (!GO_AUTH_COOKIE) throw new Error('GO_AUTH_COOKIE environment variable is not set');

	const goHeaders = { Cookie: GO_AUTH_COOKIE };

	console.log(`🧪 Debug limits: MAX_LINES=${MAX_LINES} MAX_PATTERNS=${MAX_PATTERNS}`);

	/* -------------------------------------------
	 * 1) GO reference maps (fetched once)
	 * ----------------------------------------- */

	console.log('➡️ Fetching GO lines...');
	const goLinesPayload = await fetchJson(`${GO_BASE_URL}/lines`);
	const goLines = pickArrayOrData<WithIdAndCode>(goLinesPayload, 'GO lines');
	const oldLineIdToCode = new Map<Id, Code>(goLines.map(l => [String(l._id), String(l.code)]));
	console.log(`✅ GO lines: ${oldLineIdToCode.size}`);

	console.log('➡️ Fetching GO routes...');
	const goRoutesPayload = await fetchJson(`${GO_BASE_URL}/routes`);
	const goRoutes = pickArrayOrData<WithIdAndCode>(goRoutesPayload, 'GO routes');
	const oldRouteIdToCode = new Map<Id, Code>(goRoutes.map(r => [String(r._id), String(r.code)]));
	console.log(`✅ GO routes: ${oldRouteIdToCode.size}`);

	console.log('➡️ Fetching GO stops...');
	const goStopsPayload = await fetchJson(`${GO_BASE_URL}/stops`);
	const goStops = pickArrayOrData<WithIdAndCode>(goStopsPayload, 'GO stops');
	// Only used for debug logging
	const oldStopIdToCode = new Map<Id, Code>(goStops.map(s => [String(s._id), String(s.code)]));
	console.log(`✅ GO stops: ${oldStopIdToCode.size}`);

	console.log('➡️ Fetching GO zones...');
	const goZonesPayload = await fetchJson(`${GO_BASE_URL}/zones`);
	const goZones = pickArrayOrData<WithIdAndCode>(goZonesPayload, 'GO zones');
	const oldZoneIdToCode = new Map<Id, Code>(goZones.map(z => [String(z._id), String(z.code)]));
	console.log(`✅ GO zones: ${oldZoneIdToCode.size}`);

	/* -------------------------------------------
	 * 2) Local reference maps (fetched once)
	 * ----------------------------------------- */

	console.log('➡️ Fetching local lines list...');
	const localLinesResp = await fetchJson<ApiList<LocalLineListItem>>(`${LOCAL_LINES_BASE_URL}/lines`, {
		headers: goHeaders,
	});
	const localLinesAll = localLinesResp.data ?? [];
	const localLinesForRouteScan = localLinesAll.slice(0, MAX_LINES);

	const lineCodeToNewId = new Map<Code, Id>(localLinesAll.map(l => [String(l.code), String(l._id)]));
	console.log(`✅ Local lines: ${lineCodeToNewId.size} (scanning routes from ${localLinesForRouteScan.length} line details)`);

	console.log('➡️ Fetching local stops...');
	const localStopsResp = await fetchJson<ApiList<LocalStop>>(`${LOCAL_STOPS_BASE_URL}/stops`, { headers: goHeaders });
	const localStops = localStopsResp.data ?? [];

	const legacyStopCodeToNewId = new Map<string, string>();
	const legacyMissing = 0;

	for (const s of localStops) {
		if (s.legacy_id) legacyStopCodeToNewId.set(String(s.legacy_id), String(s._id));
	}

	console.log(
		`✅ Local stops legacy map: ${legacyStopCodeToNewId.size} (missing legacy_id: ${legacyMissing}, total local stops: ${localStops.length})`,
	);

	console.log('➡️ Fetching local zones...');
	const localZonesResp = await fetchJson<ApiList<WithIdAndCode>>(`${LOCAL_ZONES_BASE_URL}/zones`, { headers: goHeaders });
	const localZones = localZonesResp.data ?? [];
	const zoneCodeToNewId = new Map<Code, Id>(localZones.map(z => [String(z.code), String(z._id)]));
	console.log(`✅ Local zones: ${zoneCodeToNewId.size}`);

	/* -------------------------------------------
	 * 3) Local routes:
	 *    routes live inside GET /lines/:id
	 *    Fetch each relevant line detail once, aggregate routes to a map.
	 * ----------------------------------------- */

	console.log('➡️ Building routeCodeToNewId from local line details (routes embedded in line)...');

	const lineDetails = await mapLimit(localLinesForRouteScan, LINE_DETAIL_CONCURRENCY, async (line) => {
		const url = `${LOCAL_LINES_BASE_URL}/lines/${encodeURIComponent(String(line._id))}`;
		const resp = await fetchJson<ApiEnvelope<LocalLineDetail>>(url, { headers: goHeaders });
		return resp.data;
	});

	const routeCodeToNewId = new Map<Code, Id>();
	let totalRoutesEmbedded = 0;

	for (const ld of lineDetails) {
		const routes = ld.routes ?? [];
		totalRoutesEmbedded += routes.length;
		for (const r of routes) {
			routeCodeToNewId.set(String(r.code), String(r._id));
		}
	}

	console.log(`✅ Local routes map: ${routeCodeToNewId.size} (embedded routes scanned: ${totalRoutesEmbedded})`);

	/* -------------------------------------------
	 * 4) GO patterns list (fetched once)
	 * ----------------------------------------- */

	console.log('➡️ Fetching GO patterns list...');
	const goPatternsPayload = await fetchJson(`${GO_BASE_URL}/patterns`, { headers: goHeaders });
	const goPatternsAll = pickArrayOrData<OriginalPatternType>(goPatternsPayload, 'GO patterns');
	const goPatterns = goPatternsAll.slice(0, MAX_PATTERNS);
	console.log(`✅ GO patterns: ${goPatternsAll.length} (processing ${goPatterns.length})`);

	/* -------------------------------------------
	 * 5) Process patterns
	 * ----------------------------------------- */

	console.log('➡️ Processing pattern details...');
	const now = Dates.now('Europe/Lisbon').unix_timestamp;

	let skipped = 0;
	let missingStopCount = 0;
	let missingStopLogged = 0;

	const preparedPatterns: Pattern[] = [];

	for (let i = 0; i < goPatterns.length; i++) {
		const originalPattern = goPatterns[i];
		const originalPatternId = String((originalPattern)._id);

		console.log(`\n--- Pattern ${i + 1}/${goPatterns.length} | id=${originalPatternId} ---`);

		try {
			const patternDetail = await fetchJson<OriginalPatternDetailType>(
				`${GO_BASE_URL}/patterns/${encodeURIComponent(originalPatternId)}`,
				{ headers: goHeaders },
			);

			// Map route: GO old route id -> route code -> local new route id
			const oldRouteId = String((patternDetail).parent_route);
			const routeCode = oldRouteIdToCode.get(oldRouteId);
			const newRouteId = routeCode ? (routeCodeToNewId.get(routeCode) ?? null) : null;

			if (!newRouteId) {
				console.log(`Skipping: no valid route mapping. oldRouteId=${oldRouteId} routeCode=${routeCode ?? 'null'}`);

				skipped += 1;
				continue;
			}

			// Map line: GO old line id -> line code -> local new line id
			const oldLineId = String((patternDetail).parent_line);
			const lineCode = oldLineIdToCode.get(oldLineId);
			const newLineId = lineCode ? (lineCodeToNewId.get(lineCode) ?? null) : null;

			if (!newLineId) {
				console.log(`Skipping: no valid line mapping. oldLineId=${oldLineId} lineCode=${lineCode ?? 'null'}`);
				skipped += 1;
				continue;
			}

			// Transform path (stops via legacy_id, zones via code mapping)
			const rawPath = ((patternDetail).path ?? []);

			const transformedPath = rawPath
				.map((pathItem, idx) => {
					const goStopId = String(pathItem.stop);
					const goStopCode = oldStopIdToCode.get(goStopId) ?? null;

					// local legacy_id is the old code, so match on code
					const newStopId = goStopCode ? (legacyStopCodeToNewId.get(goStopCode) ?? null) : null;

					if (!newStopId) {
						missingStopCount += 1;

						if (LOG_MISSING_STOPS && missingStopLogged < LOG_MISSING_STOPS_LIMIT) {
							missingStopLogged += 1;
							console.log('❌ stop mapping miss', {
								goStopCode,
								goStopId,
								idx,
								localHasLegacyCode: goStopCode ? legacyStopCodeToNewId.has(goStopCode) : false,
								pattern: (patternDetail).code,
							});
						}
					}

					const transformedZones: string[] = [];
					for (const oldZoneId of (pathItem.zones ?? []) as unknown[]) {
						const zoneCode = oldZoneIdToCode.get(String(oldZoneId));
						const newZoneId = zoneCode ? zoneCodeToNewId.get(zoneCode) : null;
						if (newZoneId) transformedZones.push(newZoneId);
					}

					return {
						_id: generateRandomString(),
						allow_drop_off: pathItem.allow_drop_off ?? true,
						allow_pickup: pathItem.allow_pickup ?? true,
						distance_delta: pathItem.distance_delta ?? null,
						stop_id: newStopId || '',
						timepoint: pathItem.timepoint ?? true,
						zones: transformedZones,
					};
				})
				.filter(item => item.stop_id !== '');

			if (transformedPath.length === 0) {
				console.log(`Skipping: empty mapped path. code=${(patternDetail).code}`);
				skipped += 1;
				continue;
			}

			const parsed = PatternSchema.safeParse({
				_id: generateRandomString(),
				code: normalizeCode((patternDetail).code),
				created_at: now,
				created_by: 'system',
				destination: normalizeText((patternDetail).destination),
				direction: (patternDetail).direction === '1' ? '1' : '0',
				headsign: normalizeText((patternDetail).headsign),
				is_locked: Boolean((patternDetail).is_locked),
				line_id: newLineId,
				origin: normalizeText((patternDetail).origin),
				path: transformedPath,
				presets: (patternDetail).presets
					? {
						dwell_time: (patternDetail).presets.dwell_time || 0,
						velocity: (patternDetail).presets.velocity || 20,
					}
					: undefined,
				route_id: newRouteId,
				shape: (patternDetail).shape
					? {
						extension: (patternDetail).shape.extension || 0,
						geojson: {
							geometry: {
								coordinates: (patternDetail).shape.geojson?.geometry?.coordinates || [],
								type: 'LineString',
							},
							properties: {},
							type: 'Feature',
						},
					}
					: undefined,
				updated_at: now,
				updated_by: 'system',
			});

			if (!parsed.success) {
				console.log('Skipping: validation error:', {
					code: (patternDetail).code,
					issues: parsed.error.issues,
				});
				skipped += 1;
				continue;
			}

			preparedPatterns.push(parsed.data);
			console.log(`✅ prepared pattern: ${parsed.data.code}`);
		}
		catch (err) {
			console.error(`Error processing pattern ${originalPatternId}:`, err);
			skipped += 1;
		}
	}

	console.log('\n==============================');
	console.log(`Prepared ${preparedPatterns.length} patterns${skipped ? ` (skipped ${skipped})` : ''}`);
	console.log(`Stop mapping misses (total): ${missingStopCount}`);
	console.log('==============================\n');

	await patterns.insertMany(preparedPatterns, { unsafe: true });
	console.log(`Inserted ${preparedPatterns.length} patterns`);
}

/* -----------------------------------------------------------------------------------------------
 * Normalizers
 * --------------------------------------------------------------------------------------------- */

function normalizeCode(value: unknown): string {
	const code = String(value ?? '').trim();
	return code.length > 10 ? code.slice(0, 10) : code;
}

function normalizeText(value: unknown): string {
	const text = String(value ?? '').trim();
	return text.length > 100 ? text.slice(0, 100) : text;
}

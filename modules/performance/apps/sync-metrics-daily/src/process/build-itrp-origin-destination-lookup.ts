/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export interface ItrpOriginDestination {
	designacao: string
	destino_dtcc: string
	destino_municipio: string
	origem_dtcc: string
	origem_municipio: string
}

interface HashedTripPathWaypoint {
	stop_id: string
	stop_sequence: number
}

interface HashedTripPatternAgg {
	_id: string
	path: HashedTripPathWaypoint[]
	route_long_name: string
}

/* * */

/** flags.stop_id → municipality_id */
let MUNICIPALITY_ID_BY_STOP_CODE_CACHE: Map<string, string> | null = null;
let MUNICIPALITY_ID_BY_STOP_CODE_CACHE_PROMISE: null | Promise<Map<string, string>> = null;

/** municipality_id → municipality name */
let MUNICIPALITY_NAME_BY_ID_CACHE: Map<string, string> | null = null;
let MUNICIPALITY_NAME_BY_ID_CACHE_PROMISE: null | Promise<Map<string, string>> = null;

/* * */

async function getMunicipalityIdByStopCodeCache(): Promise<Map<string, string>> {
	if (MUNICIPALITY_ID_BY_STOP_CODE_CACHE) {
		return MUNICIPALITY_ID_BY_STOP_CODE_CACHE;
	}

	if (!MUNICIPALITY_ID_BY_STOP_CODE_CACHE_PROMISE) {
		MUNICIPALITY_ID_BY_STOP_CODE_CACHE_PROMISE = (async () => {
			Logger.info({ message: 'Caching stops (flags.stop_id → municipality_id)...' });

			const allStops = await goDb.infrastructure.stops.findMany(
				{},
				{ projection: { flags: { stop_id: 1 }, municipality_id: 1 } },
			);

			const cache = new Map<string, string>();

			for (const stop of allStops) {
				const municipalityId = String(stop.municipality_id ?? '');
				if (!municipalityId) {
					continue;
				}

				for (const flag of stop.flags ?? []) {
					const flagStopId = String(flag.stop_id ?? '');
					if (!flagStopId) {
						continue;
					}
					cache.set(flagStopId, municipalityId);
				}
			}

			Logger.info({
				message: `Cached ${cache.size} stop-code → municipality_id mappings from ${allStops.length} stops`,
			});

			MUNICIPALITY_ID_BY_STOP_CODE_CACHE = cache;
			return cache;
		})();
	}

	return MUNICIPALITY_ID_BY_STOP_CODE_CACHE_PROMISE;
}

async function getMunicipalityNameByIdCache(): Promise<Map<string, string>> {
	if (MUNICIPALITY_NAME_BY_ID_CACHE) {
		return MUNICIPALITY_NAME_BY_ID_CACHE;
	}

	if (!MUNICIPALITY_NAME_BY_ID_CACHE_PROMISE) {
		MUNICIPALITY_NAME_BY_ID_CACHE_PROMISE = (async () => {
			Logger.info({ message: 'Caching municipalities (_id → name)...' });

			const allMunicipalities = await goDb.locations.municipalities.findMany(
				{},
				{ projection: { _id: 1, properties: 1 } },
			);

			const cache = new Map(
				allMunicipalities.map(municipality => [municipality._id, municipality.name ?? '']),
			);

			Logger.info({
				message: `Cached ${cache.size} municipality names`,
			});

			MUNICIPALITY_NAME_BY_ID_CACHE = cache;
			return cache;
		})();
	}

	return MUNICIPALITY_NAME_BY_ID_CACHE_PROMISE;
}

function getEndpointStopIds(path: HashedTripPathWaypoint[]): null | { destination: string, origin: string } {
	if (!path || path.length === 0) {
		return null;
	}

	let origin = path[0];
	let destination = path[0];

	for (const waypoint of path) {
		if (waypoint.stop_sequence < origin.stop_sequence) {
			origin = waypoint;
		}
		if (waypoint.stop_sequence > destination.stop_sequence) {
			destination = waypoint;
		}
	}

	return {
		destination: String(destination.stop_id ?? ''),
		origin: String(origin.stop_id ?? ''),
	};
}

/**
 * Builds Designação + origin/destination fields per pattern_id:
 * 1. hashed_trips → route_long_name (Designação) + first/last path.stop_id
 * 2. stops cache (flags.stop_id) → municipality_id
 * 3. municipalities cache → properties.name
 */
export async function buildItrpOriginDestinationLookup(
	patternIds: string[],
): Promise<Map<string, ItrpOriginDestination>> {
	const lookup = new Map<string, ItrpOriginDestination>();

	if (patternIds.length === 0) {
		return lookup;
	}

	//
	// Load stops + municipalities caches in parallel

	const [municipalityIdByStopCode, municipalityNameById] = await Promise.all([
		getMunicipalityIdByStopCodeCache(),
		getMunicipalityNameByIdCache(),
	]);

	//
	// 1. hashed_trips: one trip per pattern_id → route_long_name + first/last stop_id

	Logger.info({
		message: `Fetching hashed_trips designacao/endpoints for ${patternIds.length} patterns...`,
	});

	const hashedTripsCollection = await goDb.operation.hashedTrips.getCollection();
	const patternPaths = await hashedTripsCollection.aggregate<HashedTripPatternAgg>([
		{ $match: { pattern_id: { $in: patternIds } } },
		{
			$group: {
				_id: '$pattern_id',
				path: { $first: '$path' },
				route_long_name: { $first: '$route_long_name' },
			},
		},
		{
			$project: {
				_id: 1,
				path: {
					$map: {
						as: 'waypoint',
						in: {
							stop_id: '$$waypoint.stop_id',
							stop_sequence: '$$waypoint.stop_sequence',
						},
						input: '$path',
					},
				},
				route_long_name: 1,
			},
		},
	]).toArray();

	//
	// 2–4. Resolve Designação + origin/destination from caches

	for (const row of patternPaths) {
		const designacao = String(row.route_long_name ?? '');
		const endpoints = getEndpointStopIds(row.path ?? []);

		const origemDtcc = endpoints?.origin
			? (municipalityIdByStopCode.get(endpoints.origin) ?? '')
			: '';
		const destinoDtcc = endpoints?.destination
			? (municipalityIdByStopCode.get(endpoints.destination) ?? '')
			: '';

		lookup.set(String(row._id), {
			designacao,
			destino_dtcc: destinoDtcc,
			destino_municipio: municipalityNameById.get(destinoDtcc) ?? '',
			origem_dtcc: origemDtcc,
			origem_municipio: municipalityNameById.get(origemDtcc) ?? '',
		});
	}

	Logger.info({
		message: `Built designacao/origin/destination lookup for ${lookup.size} patterns`,
	});

	return lookup;
}

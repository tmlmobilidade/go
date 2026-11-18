/* * */

import { getQualifiedLineId } from '@tmlmobilidade/go-hub-pckg-utils';
import { type HubV1ApiLine, type HubV1ApiRoute, type HubV1GtfsRoutes, type HubV1GtfsTrips } from '@tmlmobilidade/go-types-hub';
import { HexColorSchema } from '@tmlmobilidade/go-types-shared';

import { type NetworkContext } from '../types/network.js';
import { type parseTripPath } from './parse-trip-path.js';

/* * */

export function updateLinesRoutes(context: NetworkContext, tripRawData: HubV1GtfsTrips, routeRawData: HubV1GtfsRoutes, tripPath: ReturnType<typeof parseTripPath>) {
	const qualifiedLineId = getQualifiedLineId(routeRawData.agency_id, routeRawData.route_short_name);
	const { districtIdsList, districtNamesList, facilitiesList, localityIdsList, localityNamesList, municipalityIdsList, municipalityNamesList, parishIdsList, parishNamesList } = tripPath;

	// Create the route object if it doesn't exist yet. Notice we're not using hashes here
	// because routes are supposed to be unique in the same GTFS file.

	let currentRouteObject: HubV1ApiRoute;

	const parsedRouteObject = context.routes.get(tripRawData.route_id);

	if (parsedRouteObject) {
		currentRouteObject = parsedRouteObject;
	} else {
		currentRouteObject = {
			_id: routeRawData.route_id,
			agency_id: routeRawData.agency_id,
			color: HexColorSchema.parse(routeRawData.route_color || '#000000'),
			district_ids: [],
			district_names: [],
			facilities: [],
			line_id: qualifiedLineId,
			locality_ids: [],
			locality_names: [],
			long_name: routeRawData.route_long_name,
			municipality_ids: [],
			municipality_names: [],
			parish_ids: [],
			parish_names: [],
			pattern_ids: [],
			short_name: routeRawData.route_short_name,
			stop_ids: [],
			text_color: HexColorSchema.parse(routeRawData.route_text_color || '#FFFFFF'),
			tts_name: '',
		};
	}

	//
	// Add to the current route (new or exising) the data retrieved from the current trip

	currentRouteObject.pattern_ids = Array.from(new Set([tripRawData.pattern_id, ...currentRouteObject.pattern_ids]));

	currentRouteObject.facilities = Array.from(new Set([...currentRouteObject.facilities, ...facilitiesList]));

	currentRouteObject.district_ids = Array.from(new Set([...currentRouteObject.district_ids, ...districtIdsList]));
	currentRouteObject.district_names = Array.from(new Set([...currentRouteObject.district_names, ...districtNamesList]));
	currentRouteObject.municipality_ids = Array.from(new Set([...currentRouteObject.municipality_ids, ...municipalityIdsList]));
	currentRouteObject.municipality_names = Array.from(new Set([...currentRouteObject.municipality_names, ...municipalityNamesList]));
	currentRouteObject.parish_ids = Array.from(new Set([...currentRouteObject.parish_ids, ...parishIdsList]));
	currentRouteObject.parish_names = Array.from(new Set([...currentRouteObject.parish_names, ...parishNamesList]));
	currentRouteObject.locality_ids = Array.from(new Set([...currentRouteObject.locality_ids, ...localityIdsList]));
	currentRouteObject.locality_names = Array.from(new Set([...currentRouteObject.locality_names, ...localityNamesList]));

	//
	// Create the line object if it doesn't exist yet

	let currentLineObject: HubV1ApiLine;

	const parsedLineObject = context.lines.get(qualifiedLineId);

	if (parsedLineObject) {
		currentLineObject = parsedLineObject;
	} else {
		currentLineObject = {
			_id: qualifiedLineId,
			agency_id: routeRawData.agency_id,
			color: HexColorSchema.parse(routeRawData.route_color || '#000000'),
			district_ids: [],
			district_names: [],
			facilities: [],
			locality_ids: [],
			locality_names: [],
			long_name: routeRawData.route_long_name,
			municipality_ids: [],
			municipality_names: [],
			parish_ids: [],
			parish_names: [],
			pattern_ids: [],
			route_ids: [],
			short_name: routeRawData.route_short_name,
			stop_ids: [],
			text_color: HexColorSchema.parse(routeRawData.route_text_color || '#FFFFFF'),
			tts_name: '',
		};
	}

	//
	// Add to the current line (new or exising) the data retrieved from the current trip

	currentLineObject.route_ids = Array.from(new Set([tripRawData.route_id, ...currentLineObject.route_ids]));
	currentLineObject.pattern_ids = Array.from(new Set([tripRawData.pattern_id, ...currentLineObject.pattern_ids]));

	currentLineObject.facilities = Array.from(new Set([...currentLineObject.facilities, ...facilitiesList]));

	currentLineObject.district_ids = Array.from(new Set([...currentLineObject.district_ids, ...districtIdsList]));
	currentLineObject.district_names = Array.from(new Set([...currentLineObject.district_names, ...districtNamesList]));
	currentLineObject.municipality_ids = Array.from(new Set([...currentLineObject.municipality_ids, ...municipalityIdsList]));
	currentLineObject.municipality_names = Array.from(new Set([...currentLineObject.municipality_names, ...municipalityNamesList]));
	currentLineObject.parish_ids = Array.from(new Set([...currentLineObject.parish_ids, ...parishIdsList]));
	currentLineObject.parish_names = Array.from(new Set([...currentLineObject.parish_names, ...parishNamesList]));
	currentLineObject.locality_ids = Array.from(new Set([...currentLineObject.locality_ids, ...localityIdsList]));
	currentLineObject.locality_names = Array.from(new Set([...currentLineObject.locality_names, ...localityNamesList]));

	//
	// Save the updated objects back to the maps

	context.lines.set(qualifiedLineId, currentLineObject);
	context.routes.set(routeRawData.route_id, currentRouteObject);
}

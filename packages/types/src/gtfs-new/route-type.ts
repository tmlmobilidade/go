/* * */

import { z } from 'zod';

/**
 * Represents the type of vehicle or service provided by a GTFS Route.
 * This type is used to categorize the route based on the mode of transportation it represents.
 * Each route type corresponds to a specific mode of transit, such as bus, subway, ferry, etc.
 * The values are defined according to the GTFS specification.
 */
export const GtfsRouteTypeValues = [
	'0', // Tram, Streetcar, Light rail. Any light rail or street level system within a metropolitan area.
	'1', // Subway, Metro. Any underground rail system within a metropolitan area.
	'2', // Rail. Used for intercity or long-distance travel.
	'3', // Bus. Used for short- and long-distance bus routes.
	'4', // Ferry. Used for short- and long-distance boat service.
	'5', // Cable tram. Used for street-level rail cars where the cable runs beneath the vehicle (e.g., cable car in San Francisco).
	'6', // Aerial lift, suspended cable car (e.g., gondola lift, aerial tramway). Cable transport where cabins, cars, gondolas or open chairs are suspended by means of one or more cables.
	'7', // Funicular. Any rail system designed for steep inclines.
	'11', // Trolleybus. Electric buses that draw power from overhead wires using poles.
	'12', // Monorail. Railway in which the track consists of a single rail or a beam.
] as const;

export const GtfsRouteTypeSchema = z.enum(GtfsRouteTypeValues);

export type GtfsRouteType = z.infer<typeof GtfsRouteTypeSchema>;

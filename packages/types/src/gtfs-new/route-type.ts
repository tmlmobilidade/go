/* * */

import { z } from 'zod';

/**
 * Represents the type of vehicle or service provided by a GTFS Route.
 * This type is used to categorize the route based on the mode of transportation it represents.
 * Each route type corresponds to a specific mode of transit, such as bus, subway, ferry, etc.
 * The values are defined according to the GTFS specification.
 */
export const GtfsRouteTypeSchema = z.union([
	z.literal(0), // Tram, Streetcar, Light rail. Any light rail or street level system within a metropolitan area.
	z.literal(1), // Subway, Metro. Any underground rail system within a metropolitan area.
	z.literal(2), // Rail. Used for intercity or long-distance travel.
	z.literal(3), // Bus. Used for short- and long-distance bus routes.
	z.literal(4), // Ferry. Used for short- and long-distance boat service.
	z.literal(5), // Cable tram. Used for street-level rail cars where the cable runs beneath the vehicle (e.g., cable car in San Francisco).
	z.literal(6), // Aerial lift, suspended cable car (e.g., gondola lift, aerial tramway). Cable transport where cabins, cars, gondolas or open chairs are suspended by means of one or more cables.
	z.literal(7), // Funicular. Any rail system designed for steep inclines.
	z.literal(11), // Trolleybus. Electric buses that draw power from overhead wires using poles.
	z.literal(12), // Monorail. Railway in which the track consists of a single rail or a beam.
]);
export type GtfsRouteType = z.infer<typeof GtfsRouteTypeSchema>;

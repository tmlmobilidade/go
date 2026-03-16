/* * */

import { z } from 'zod';

/**
 * The GTFS Binary type represents a boolean value
 * in the GTFS (General Transit Feed Specification) format.
 * GTFS uses 0 and 1 to indicate either TRUE / FALSE or fields
 * with binary states, such as direction or availability.
 */
export const GtfsBinarySchema = z.union([z.literal(0), z.literal(1)]);
export type GtfsBinary = z.infer<typeof GtfsBinarySchema>;

/**
 * The GTFS Ternary type represents a value that can be one of three states:
 * 0 (NOT_SPECIFIED), 1 (YES), or 2 (NO). This is used in GTFS to indicate
 * optional or unknown states for certain fields, such as whether a service
 * is enabled, disabled, or unknown.
 */
export const GtfsTernarySchema = z.union([z.literal(0), z.literal(1), z.literal(2)]);
export type GtfsTernary = z.infer<typeof GtfsTernarySchema>;

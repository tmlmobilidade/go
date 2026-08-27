/* * */

import { type HubVehiclePosition, HubVehiclePositionSchema } from '@tmlmobilidade/go-types-public-info';
import { Logger } from '@tmlmobilidade/logger';
import { getPublicLineId, getPublicPatternId } from '@tmlmobilidade/utils';

/* * */

/**
 * Parses an array of raw vehicle position events, transforming and validating each one.
 *
 * Each event is converted to a valid `HubVehiclePosition`:
 * - Skips events without a `trip_id`.
 * - Transforms `line_id` and `pattern_id` using the appropriate public ID helpers,
 *   or sets them to `null` if missing.
 * - Validates the transformed event using `HubVehiclePositionSchema`.
 * - Logs an error and skips entries that do not validate.
 *
 * @param events Array of raw vehicle position events to parse.
 * @returns Array of valid, parsed `HubVehiclePosition` objects.
 */
export function parseVehiclePositions(events: HubVehiclePosition[]): HubVehiclePosition[] {
	const positions: HubVehiclePosition[] = [];

	for (const event of events) {
		try {
			if (!event.trip_id) continue;

			const parsed = HubVehiclePositionSchema.safeParse({
				...event,
				line_id: event.line_id ? getPublicLineId(event.agency_id, event.line_id) : null,
				pattern_id: event.pattern_id ? getPublicPatternId(event.agency_id, event.pattern_id) : null,
			});

			if (!parsed.success) throw new Error(`Error parsing vehicle position ID: ${event._id}: ${parsed.error.message}`);

			positions.push(parsed.data);
		} catch (error) {
			Logger.error({ message: `Error parsing vehicle position ID: ${event._id}: ${(error as Error).message}` });
		}
	}

	return positions;
}

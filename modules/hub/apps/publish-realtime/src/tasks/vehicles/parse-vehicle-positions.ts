/* * */

import { type HubVehiclePosition, HubVehiclePositionSchema } from '@tmlmobilidade/go-types-hub';
import { toCalendarDate } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/logger';

/* * */

/**
 * Validates vehicle positions already public-ID-formatted by SQL.
 *
 * - Skips events without a `trip_id`.
 * - Adds `calendar_date` from `operational_date`.
 * - Validates with `HubVehiclePositionSchema`; logs and skips failures.
 */
export function parseVehiclePositions(events: HubVehiclePosition[]): HubVehiclePosition[] {
	const positions: HubVehiclePosition[] = [];

	for (const event of events) {
		try {
			if (!event.trip_id) continue;

			const parsed = HubVehiclePositionSchema.safeParse({
				...event,
				calendar_date: toCalendarDate(String(event.operational_date)),
			});

			if (!parsed.success) throw new Error(`Error parsing vehicle position ID: ${event._id}: ${parsed.error.message}`);

			positions.push(parsed.data);
		} catch (error) {
			Logger.error({ message: `Error parsing vehicle position ID: ${event._id}: ${(error as Error).message}` });
		}
	}

	return positions;
}

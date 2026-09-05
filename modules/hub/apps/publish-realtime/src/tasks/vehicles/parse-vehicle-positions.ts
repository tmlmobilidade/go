/* * */

import { type HubV1ApiVehiclePosition, HubV1ApiVehiclePositionSchema } from '@tmlmobilidade/go-types-hub';
import { toCalendarDate } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Validates vehicle positions already public-ID-formatted by SQL.
 * - Skips events without a `trip_id`.
 * - Adds `calendar_date` from `operational_date`.
 * - Validates with `HubV1ApiVehiclePositionSchema`; logs and skips failures.
 */
export function parseVehiclePositions(vehiclePositions: HubV1ApiVehiclePosition[]): HubV1ApiVehiclePosition[] {
	//

	const parsedPositions: HubV1ApiVehiclePosition[] = [];

	for (const position of vehiclePositions) {
		try {
			if (!position.trip_id) continue;

			const parsed = HubV1ApiVehiclePositionSchema.safeParse({
				...position,
				calendar_date: toCalendarDate(position.operational_date),
			});

			if (!parsed.success) throw new Error(`Error parsing vehicle position ID: ${position._id}: ${parsed.error.message}`);

			parsedPositions.push(parsed.data);
		} catch (error) {
			Logger.error({ message: `Error parsing vehicle position ID: ${position._id}: ${(error as Error).message}` });
		}
	}

	return parsedPositions;
}

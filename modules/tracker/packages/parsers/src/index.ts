/* * */

import { parseRawVehicleEventCapV1 } from '@/cap/cap-v1.js';
import { parseRawVehicleEventCcflV1 } from '@/ccfl/ccfl-v1.js';
import { parseRawVehicleEventCmetV1 } from '@/cmet/cmet-v1.js';
import { parseRawVehicleEventTtslV1 } from '@/ttsl/ttsl-v1.js';
import { type RawVehicleEvent, type SimplifiedVehicleEvent } from '@tmlmobilidade/types';

/* * */

export const PARSER_MAP: Record<RawVehicleEvent['version'], (vehicleEvent: RawVehicleEvent) => null | SimplifiedVehicleEvent> = {
	'cap-v1': parseRawVehicleEventCapV1,
	'ccfl-v1': parseRawVehicleEventCcflV1,
	'cmet-v1': parseRawVehicleEventCmetV1,
	'ttsl-v1': parseRawVehicleEventTtslV1,
};

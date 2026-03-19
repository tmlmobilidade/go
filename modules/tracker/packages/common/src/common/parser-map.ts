/* * */

import { parseTrackerCmetV1 } from '@/cmet/index.js';
import { parseTrackerTtslV1 } from '@/ttsl/index.js';
import { SimplifiedVehicleEvent } from '@tmlmobilidade/types';

import { TrackerVehicleEvent } from './vehicle-event.js';

/* * */

export const PARSER_MAP: Record<TrackerVehicleEvent['version'], (vehicleEvent: TrackerVehicleEvent) => SimplifiedVehicleEvent> = {
	'cmet-v1': parseTrackerCmetV1,
	'ttsl-v1': parseTrackerTtslV1,
};

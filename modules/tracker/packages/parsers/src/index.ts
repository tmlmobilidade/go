/* * */

import { parseRawVehicleEventCcflV1 } from '@/ccfl/ccfl-v1.js';
import { parseRawVehicleEventCmetV1Core } from '@/cmet/cmet-v1-core.js';
import { parseRawVehicleEventCmetV1Log } from '@/cmet/cmet-v1-log.js';
import { parseRawVehicleEventCpV1 } from '@/cp/cp-v1.js';
import { parseRawVehicleEventCrtmAisaV1 } from '@/crtm-aisa/crtm-aisa-v1.js';
import { parseRawVehicleEventCrtmLaVelozV1 } from '@/crtm-laveloz/crtm-laveloz-v1.js';
import { parseRawVehicleEventFertagusV1 } from '@/fertagus/fertagus-v1.js';
import { parseRawVehicleEventMlV1 } from '@/ml/ml-v1.js';
import { parseRawVehicleEventMobiV1 } from '@/mobi/mobi-v1.js';
import { parseRawVehicleEventTcbV1 } from '@/tcb/tcb-v1.js';
import { parseRawVehicleEventTtslV1 } from '@/ttsl/ttsl-v1.js';
import { type RawVehicleEvent, type SimplifiedVehicleEvent } from '@tmlmobilidade/types';

/* * */

export const PARSER_MAP: Record<RawVehicleEvent['version'], (vehicleEvent: RawVehicleEvent) => null | SimplifiedVehicleEvent> = {
	'ccfl-v1': parseRawVehicleEventCcflV1,
	'cmet-v1-core': parseRawVehicleEventCmetV1Core,
	'cmet-v1-log': parseRawVehicleEventCmetV1Log,
	'cp-v1': parseRawVehicleEventCpV1,
	'crtm-aisa-v1': parseRawVehicleEventCrtmAisaV1,
	'crtm-laveloz-v1': parseRawVehicleEventCrtmLaVelozV1,
	'fertagus-v1': parseRawVehicleEventFertagusV1,
	'ml-v1': parseRawVehicleEventMlV1,
	'mobi-v1': parseRawVehicleEventMobiV1,
	'tcb-v1': parseRawVehicleEventTcbV1,
	'ttsl-v1': parseRawVehicleEventTtslV1,
};

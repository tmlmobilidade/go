/* * */

import { parseRawVehicleEventCmetV1 } from '@/cmet/cmet-v1.js';
import { parseRawVehicleEventTtslV1 } from '@/ttsl/ttsl-v1.js';
import { type AnySimplifiedApex, type RawApexTransaction } from '@tmlmobilidade/types';

/* * */

export const PARSER_MAP: Record<RawApexTransaction['version'], (apexTransaction: RawApexTransaction) => AnySimplifiedApex> = {
	'cmet-v1': parseRawVehicleEventCmetV1,
	'ttsl-v1': parseRawVehicleEventTtslV1,
};

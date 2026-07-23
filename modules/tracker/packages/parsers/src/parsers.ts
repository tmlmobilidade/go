/* * */

import { parseRawVehicleEventEsCrtmAisaV1 } from '@/es/crtm/aisa/v1.js';
import { parseRawVehicleEventEsCrtmLaVelozV1 } from '@/es/crtm/la-veloz/v1.js';
import { parseRawVehicleEventPtTmlCcflV1 } from '@/pt/tml/ccfl/v1.js';
import { parseRawVehicleEventPtTmlCmV1 } from '@/pt/tml/cm/v1.js';
import { parseRawVehicleEventPtTmlCpV1 } from '@/pt/tml/cp/v1.js';
import { parseRawVehicleEventPtTmlFertagusV1 } from '@/pt/tml/fertagus/v1.js';
import { parseRawVehicleEventPtTmlMlV1 } from '@/pt/tml/ml/v1.js';
import { parseRawVehicleEventPtTmlMobiV1 } from '@/pt/tml/mobi/v1.js';
import { parseRawVehicleEventPtTmlTcbV1 } from '@/pt/tml/tcb/v1.js';
import { parseRawVehicleEventPtTmlTtslV1 } from '@/pt/tml/ttsl/v1.js';
import { parseRawVehicleEventPtTmpUnirV1 } from '@/pt/tmp/unir/v1.js';
import { type RawVehicleEvent, type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';

/* * */

export const PARSER_MAP: Record<RawVehicleEvent['version'], (vehicleEvent: RawVehicleEvent) => null | SimplifiedVehicleEvent> = {
	'es-crtm-aisa-v1': parseRawVehicleEventEsCrtmAisaV1,
	'es-crtm-la-veloz-v1': parseRawVehicleEventEsCrtmLaVelozV1,
	'pt-tml-ccfl-v1': parseRawVehicleEventPtTmlCcflV1,
	'pt-tml-cm-v1': parseRawVehicleEventPtTmlCmV1,
	'pt-tml-cp-v1': parseRawVehicleEventPtTmlCpV1,
	'pt-tml-fertagus-v1': parseRawVehicleEventPtTmlFertagusV1,
	'pt-tml-ml-v1': parseRawVehicleEventPtTmlMlV1,
	'pt-tml-mobi-v1': parseRawVehicleEventPtTmlMobiV1,
	'pt-tml-tcb-v1': parseRawVehicleEventPtTmlTcbV1,
	'pt-tml-ttsl-v1': parseRawVehicleEventPtTmlTtslV1,
	'pt-tmp-unir-v1': parseRawVehicleEventPtTmpUnirV1,
};

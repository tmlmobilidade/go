/* * */

import { RawVehicleEventEsCrtmAisaV1Schema } from '@/raw/es/crtm/aisa/v1.js';
import { RawVehicleEventEsCrtmLaVelozV1Schema } from '@/raw/es/crtm/la-veloz/v1.js';
import { RawVehicleEventPtTmlCcflV1Schema } from '@/raw/pt/tml/ccfl/v1.js';
import { RawVehicleEventPtTmlCmAlsaV1Schema } from '@/raw/pt/tml/cm/alsa/v1.js';
import { RawVehicleEventPtTmlCmRlV1Schema } from '@/raw/pt/tml/cm/rl/v1.js';
import { RawVehicleEventPtTmlCmTstV1Schema } from '@/raw/pt/tml/cm/tst/v1.js';
import { RawVehicleEventPtTmlCmVaV1Schema } from '@/raw/pt/tml/cm/va/v1.js';
import { RawVehicleEventPtTmlCpV1Schema } from '@/raw/pt/tml/cp/v1.js';
import { RawVehicleEventPtTmlFertagusV1Schema } from '@/raw/pt/tml/fertagus/v1.js';
import { RawVehicleEventPtTmlMlV1Schema } from '@/raw/pt/tml/ml/v1.js';
import { RawVehicleEventPtTmlMobiV1Schema } from '@/raw/pt/tml/mobi/v1.js';
import { RawVehicleEventPtTmlTcbV1Schema } from '@/raw/pt/tml/tcb/v1.js';
import { RawVehicleEventPtTmlTtslV1Schema } from '@/raw/pt/tml/ttsl/v1.js';
import { RawVehicleEventPtTmpUnirV1Schema } from '@/raw/pt/tmp/unir/v1.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventSchema = z.discriminatedUnion('version', [
	RawVehicleEventEsCrtmAisaV1Schema,
	RawVehicleEventEsCrtmLaVelozV1Schema,
	RawVehicleEventPtTmlCcflV1Schema,
	RawVehicleEventPtTmlCmAlsaV1Schema,
	RawVehicleEventPtTmlCmRlV1Schema,
	RawVehicleEventPtTmlCmTstV1Schema,
	RawVehicleEventPtTmlCmVaV1Schema,
	RawVehicleEventPtTmlCpV1Schema,
	RawVehicleEventPtTmlFertagusV1Schema,
	RawVehicleEventPtTmlMlV1Schema,
	RawVehicleEventPtTmlMobiV1Schema,
	RawVehicleEventPtTmlTcbV1Schema,
	RawVehicleEventPtTmlTtslV1Schema,
	RawVehicleEventPtTmpUnirV1Schema,
]);

/**
 * This type represents the raw vehicle event as it is received from
 * the data sources (e.g., GTFS-RT feeds, extended variants, etc.).
 * It includes all the fields present in the original event,
 * without any transformation or simplification, but with a common header like structure
 * to keep track of version, entity_id, and other metadata.
 * This type is used for storing the raw events in the database
 * before converting them into the simplified format.
 */
export type RawVehicleEvent = z.infer<typeof RawVehicleEventSchema>;

/**
 * A HashableRawVehicleEvent is a RawVehicleEvent without the _id and received_at fields,
 * which are not relevant for hashing purposes. This type is used to create a unique hash
 * for each vehicle event based on its content, allowing us to identify duplicate events
 * and avoid storing them multiple times in the database.
 */
export type HashableRawVehicleEvent<T extends RawVehicleEvent> = Omit<T, '_id' | 'received_at'>;

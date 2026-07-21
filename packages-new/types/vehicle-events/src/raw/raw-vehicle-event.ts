/* * */

import { z } from 'zod';

import { RawVehicleEventEsCrtmAisaV1Schema } from './es/crtm/aisa/v1.js';
import { RawVehicleEventEsCrtmLaVelozV1Schema } from './es/crtm/la-veloz/v1.js';
import { RawVehicleEventPtTmlCcflV1Schema } from './pt/tml/ccfl/v1.js';
import { RawVehicleEventPtTmlCmetV1CoreSchema } from './pt/tml/cmet/v1-core.js';
import { RawVehicleEventPtTmlCmetV1LogSchema } from './pt/tml/cmet/v1-log.js';
import { RawVehicleEventPtTmlCpV1Schema } from './pt/tml/cp/v1.js';
import { RawVehicleEventPtTmlFertagusV1Schema } from './pt/tml/fertagus/v1.js';
import { RawVehicleEventPtTmlMlV1Schema } from './pt/tml/ml/v1.js';
import { RawVehicleEventPtTmlMobiV1Schema } from './pt/tml/mobi/v1.js';
import { RawVehicleEventPtTmlTcbV1Schema } from './pt/tml/tcb/v1.js';
import { RawVehicleEventPtTmlTtslV1Schema } from './pt/tml/ttsl/v1.js';
import { RawVehicleEventPtTmpUnirV1Schema } from './pt/tmp/unir/v1.js';

/* * */

export const RawVehicleEventSchema = z.discriminatedUnion('version', [
	RawVehicleEventEsCrtmAisaV1Schema,
	RawVehicleEventEsCrtmLaVelozV1Schema,
	RawVehicleEventPtTmpUnirV1Schema,
	RawVehicleEventPtTmlCcflV1Schema,
	RawVehicleEventPtTmlCmetV1CoreSchema,
	RawVehicleEventPtTmlCmetV1LogSchema,
	RawVehicleEventPtTmlCpV1Schema,
	RawVehicleEventPtTmlFertagusV1Schema,
	RawVehicleEventPtTmlMlV1Schema,
	RawVehicleEventPtTmlMobiV1Schema,
	RawVehicleEventPtTmlTcbV1Schema,
	RawVehicleEventPtTmlTtslV1Schema,
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

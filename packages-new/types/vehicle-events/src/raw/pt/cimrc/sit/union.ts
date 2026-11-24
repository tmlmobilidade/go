import { z } from 'zod';

import { RawVehicleEventPtCimrcSitV1Schema } from './v1.js';

export const RawVehicleEventPtCimrcSitSchema = z.discriminatedUnion('version', [RawVehicleEventPtCimrcSitV1Schema]);
export type RawVehicleEventPtCimrcSit = z.infer<typeof RawVehicleEventPtCimrcSitSchema>;

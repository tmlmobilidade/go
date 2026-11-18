import { z } from 'zod';

import { RawVehicleEventPtCimraCiraBuswayV1Schema } from './v1.js';

export const RawVehicleEventPtCimraCiraBuswaySchema = z.discriminatedUnion('version', [RawVehicleEventPtCimraCiraBuswayV1Schema]);
export type RawVehicleEventPtCimraCiraBusway = z.infer<typeof RawVehicleEventPtCimraCiraBuswaySchema>;

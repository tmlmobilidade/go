/* * */

import { RideAnalysesRegistrySchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/* * */

export const ControllerRidesDetailRideAnalysesItemSchema = RideAnalysesRegistrySchema;

/**
 * A read model combining the canonical ride analyses data.
 * It is intended for use in the controller module.
 */
export type ControllerRidesDetailRideAnalysesItem = z.infer<typeof ControllerRidesDetailRideAnalysesItemSchema>;

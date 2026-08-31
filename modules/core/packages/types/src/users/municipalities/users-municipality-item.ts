/* * */

import { MunicipalitySchema } from '@tmlmobilidade/go-types-locations';
import { z } from 'zod';

/* * */

export const UsersMunicipalityItemSchema = MunicipalitySchema;

/**
 * The item schema for listing users agencies.
 * It is intended for use in the users module.
 */
export type UsersMunicipalityItem = z.infer<typeof UsersMunicipalityItemSchema>;

/* * */

import { MunicipalitySchema } from '@tmlmobilidade/go-types-locations';
import { z } from 'zod';

/* * */

export const RolesMunicipalityItemSchema = MunicipalitySchema;

/**
 * The item schema for listing roles municipalities.
 * It is intended for use in the roles module.
 */
export type RolesMunicipalityItem = z.infer<typeof RolesMunicipalityItemSchema>;

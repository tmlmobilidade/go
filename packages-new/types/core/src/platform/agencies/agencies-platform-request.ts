/* * */

import { ScopeActionsSchema } from '@tmlmobilidade/go-types-permissions';
import { z } from 'zod';

/* * */

export const AgenciesPlatformRequestSchema = ScopeActionsSchema;

/**
 * The request schema for getting agencies platform data
 * for a given scope.
 */
export type AgenciesPlatformRequest = z.infer<typeof AgenciesPlatformRequestSchema>;

/* * */

import { z } from 'zod';

/* * */

export const ModuleIdValues = ['apex', 'core', 'dates', 'exporter', 'hub', 'infrastructure', 'offer', 'operation', 'performance', 'tracker'] as const;
export const ModuleIdSchema = z.enum(ModuleIdValues);

export type ModuleId = z.infer<typeof ModuleIdSchema>;

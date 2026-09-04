/* * */

import { z } from 'zod';

/* * */

export const StopEquipmentValues = [
	'pip',
	'mupi',
	'mini_pip',
] as const;

export const StopEquipmentSchema = z.enum(StopEquipmentValues);

export type StopEquipment = z.infer<typeof StopEquipmentSchema>;

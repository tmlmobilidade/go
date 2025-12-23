/* * */

import { z } from 'zod';

/* * */

const StopEquipmentValues = [
	'pip',
	'mupi',
	'mini_pip',
] as const;

export const StopEquipmentSchema = z.enum(StopEquipmentValues);

export type StopEquipment = z.infer<typeof StopEquipmentSchema>;

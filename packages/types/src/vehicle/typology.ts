/* * */

import z from 'zod';

/* * */

export const VehicleTypologyValues = ['1', '2', '3', '4', '5', '6'] as const;
export const VehicleTypologySchema = z.enum(VehicleTypologyValues);
export type VehicleTypology = z.infer<typeof VehicleTypologySchema>;

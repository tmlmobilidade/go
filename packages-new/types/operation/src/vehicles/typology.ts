/* * */

import z from 'zod';

/* * */

export const VehicleTypologyValues = ['bus', 'train', 'tram', 'metro', 'ship', 'funicular'] as const;
export const VehicleTypologySchema = z.enum(VehicleTypologyValues);
export type VehicleTypology = z.infer<typeof VehicleTypologySchema>;

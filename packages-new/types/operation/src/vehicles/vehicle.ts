/* * */

import { BaseDocumentSchema, OperationalDateSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { VehicleEmissionSchema } from './emission.js';
import { VehiclePropulsionSchema } from './propulsion.js';
import { VehicleTypeSchema } from './vehicle_type.js';

/* * */

export const vehicleSchema = BaseDocumentSchema.extend({
	agency_id: z.string().nullable().optional(),
	bicycles_capacity: z.number(),
	car_capacity: z.number().nullable().optional(),
	emission: VehicleEmissionSchema,
	make: z.string(),
	model: z.string(),
	propulsion: VehiclePropulsionSchema,
	registration_date: OperationalDateSchema,
	total_capacity: z.number(),
	vehicle_code: z.string(),
	vehicle_id: z.string(),
	vehicle_type: VehicleTypeSchema,
	wheelchair_accessible: z.number(),
});

export const CreateVehicleSchema = vehicleSchema.omit({ created_at: true, updated_at: true });
export const UpdateVehicleSchema = CreateVehicleSchema.omit({ created_by: true }).partial();

/* * */

export type Vehicle = z.infer<typeof vehicleSchema>;
export type CreateVehicleDto = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicleDto = z.infer<typeof UpdateVehicleSchema>;

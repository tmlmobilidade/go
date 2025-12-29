/* * */

import { DocumentSchema } from '@/_common/document.js';
import { operationalDateSchema } from '@/_common/operational-date.js';
import { z } from 'zod';

import { VehicleEmissionSchema } from './emission.js';
import { VehiclePropulsionSchema } from './propulsion.js';
import { VehicleWheelchairSchema } from './wheelchair.js';

/* * */

export const vehicleSchema = DocumentSchema.extend({
	agency_id: z.string(),
	bikes_allowed: z.boolean(),
	capacity_seated: z.number(),
	capacity_standing: z.number(),
	contactless: z.boolean(),
	emission_class: z.array(VehicleEmissionSchema).default([]),
	license_plate: z.string(),
	make: z.string(),
	model: z.string(),
	owner: z.string(),
	passenger_counting: z.boolean(),
	propulsion: z.array(VehiclePropulsionSchema).default([]),
	registration_date: z.array(operationalDateSchema).default([]),
	wheelchair_acessible: z.array(VehicleWheelchairSchema).default([]),
});

export const CreateVehicleSchema = vehicleSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateVehicleSchema = CreateVehicleSchema.omit({ created_by: true }).partial();

/* * */

export type Vehicle = z.infer<typeof vehicleSchema>;
export type CreateVehicleDto = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicleDto = z.infer<typeof UpdateVehicleSchema>;

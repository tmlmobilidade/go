import { DocumentSchema } from '@/_common/document.js';
import { OperationalDateSchema } from '@/_common/operational-date.js';
import { z } from 'zod';

import { VehicleEmissionSchema } from './emission.js';
import { VehiclePropulsionSchema } from './propulsion.js';
import { VehicleWheelchairSchema } from './wheelchair.js';

/* Example regex for license plates (adjust to your region) */
const licensePlateRegex = /^([A-Z]{2}[0-9]{2}[A-Z]{2}|[0-9]{2}[A-Z]{2}[0-9]{2})$/;

/* * */

export const vehicleSchema = DocumentSchema.extend({
	agency_id: z.string(),
	bikes_allowed: z.boolean().default(false),
	capacity_seated: z.number().optional(),
	capacity_standing: z.number().optional(),
	contactless: z.boolean().default(false),
	emission_class: z.string(VehicleEmissionSchema),
	license_plate: z.string().regex(licensePlateRegex, 'Formato de matrícula inválido'),
	make: z.string(),
	model: z.string(),
	owner: z.string(),
	passenger_counting: z.boolean().default(false),
	propulsion: z.string(VehiclePropulsionSchema),
	registration_date: z.string(OperationalDateSchema),
	wheelchair_acessible: z.string(VehicleWheelchairSchema),
});

export const CreateVehicleSchema = vehicleSchema.omit({ created_at: true, updated_at: true });
export const UpdateVehicleSchema = CreateVehicleSchema.omit({ created_by: true }).partial();

/* * */

export type Vehicle = z.infer<typeof vehicleSchema>;
export type CreateVehicleDto = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicleDto = z.infer<typeof UpdateVehicleSchema>;

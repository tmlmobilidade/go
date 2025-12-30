import { DocumentSchema } from '@/_common/document.js';
import { operationalDateSchema } from '@/_common/operational-date.js';
import { z } from 'zod';

import { VehicleEmissionSchema } from './emission.js';
import { VehiclePropulsionSchema } from './propulsion.js';
import { VehicleWheelchairSchema } from './wheelchair.js';

/* Example regex for license plates (adjust to your region) */
const licensePlateRegex = /^[A-Z0-9]{1,7}$/; // simple pattern: 1-7 alphanumeric uppercase

// // Async function to check uniqueness (replace with real DB check)
// async function isLicensePlateUnique(plate: string): Promise<boolean> {
// 	// Replace with your actual database check
// 	const existingPlates = ['ABC123', 'XYZ789'];
// 	return !existingPlates.includes(plate);
// }

/* * */

export const vehicleSchema = DocumentSchema.extend({
	agency_id: z.string(),
	bikes_allowed: z.boolean().default(false),
	capacity_seated: z.number(),
	capacity_standing: z.number(),
	contactless: z.boolean().default(false),
	emission_class: z.string(VehicleEmissionSchema).default(''),
	license_plate: z.string().regex(licensePlateRegex, 'Invalid license plate format'),
	make: z.string(),
	model: z.string(),
	owner: z.string(),
	passenger_counting: z.boolean().default(false),
	propulsion: z.string(VehiclePropulsionSchema).default(''),
	registration_date: z.string(operationalDateSchema).default(''),
	wheelchair_acessible: z.string(VehicleWheelchairSchema).default(''),
});

export const CreateVehicleSchema = vehicleSchema.omit({ created_at: true, updated_at: true });
export const UpdateVehicleSchema = CreateVehicleSchema.omit({ created_by: true }).partial();

/* * */

export type Vehicle = z.infer<typeof vehicleSchema>;
export type CreateVehicleDto = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicleDto = z.infer<typeof UpdateVehicleSchema>;

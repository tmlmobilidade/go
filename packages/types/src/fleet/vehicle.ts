/* * */

import { DocumentSchema } from '@/_common/document.js';
import { operationalDateSchema } from '@/_common/operational-date.js';
import { z } from 'zod';

/* * */

const propulsion = [
	'Gasoline',
	'Diesel',
	'LPG auto',
	'Mixture',
	'Biodiesel',
	'Electricity',
	'Hybrid',
	'Natural Gas',
] as const;

const emission = [
	'EURO I',
	'EURO II',
	'EURO III',
	'EURO IV',
	'EURO V',
	'EURO VI',
] as const;

const wheelchair = [
	'no',
	'yes',
] as const;

export const vehicleSchema = DocumentSchema.extend({
	agency_id: z.array(z.string()).default([]),
	bikes_allowed: z.boolean(),
	capacity_seated: z.number(),
	capacity_standing: z.number(),
	contactless: z.boolean(),
	emission_class: z.enum(emission),
	license_plate: z.string(),
	make: z.string(),
	model: z.string(),
	owner: z.string(),
	passenger_counting: z.boolean(),
	propulsion: z.enum(propulsion),
	registration_date: z.array(operationalDateSchema).default([]),
	vehicle_id: z.string(),
	wheelchair_acessible: z.enum(wheelchair),
});

export const CreateVehicleSchema = vehicleSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateVehicleSchema = CreateVehicleSchema.omit({ created_by: true }).partial();

/* * */

export type Vehicle = z.infer<typeof vehicleSchema>;
export type CreateVehicleDto = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicleDto = z.infer<typeof UpdateVehicleSchema>;

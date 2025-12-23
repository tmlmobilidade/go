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
] as const

const emission = [
	'EURO I',
	'EURO II',
	'EURO III',
	'EURO IV',
	'EURO V',
	'EURO VI',
] as const

const wheelchair = [
	'no',
	'yes',
] as const

export const AnnotationSchema = DocumentSchema.extend({
	agency_id: z.array(z.string()).default([]),
	vehicle_id: z.string(),
	license_plate: z.string(),
	make: z.string(),
	model: z.string(),
	owner: z.string(),
	propulsion: z.enum(propulsion),
	emission_class: z.enum(emission),
	registration_date: z.array(operationalDateSchema).default([]),
	capacity_seated: z.number(),
	capacity_standing: z.number(),
	passenger_counting: z.boolean(),
	wheelchair_acessible: z.enum(wheelchair),
	bikes_allowed: z.boolean(),
	contactless: z.boolean(),
});

export const CreateAnnotationSchema = AnnotationSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateAnnotationSchema = CreateAnnotationSchema.omit({ created_by: true }).partial();

/* * */

export type Annotation = z.infer<typeof AnnotationSchema>;
export type CreateAnnotationDto = z.infer<typeof CreateAnnotationSchema>;
export type UpdateAnnotationDto = z.infer<typeof UpdateAnnotationSchema>;

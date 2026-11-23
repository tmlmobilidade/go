import { z } from 'zod';

export const OrganizationContactSchema = z.object({
	_id: z.string().min(1).optional(),
	email: z.email().optional(),
	job_description: z.string().default(''),
	name: z.string().trim().min(1),
	phone: z.string().trim().min(1).optional(),
});

export type OrganizationContact = z.infer<typeof OrganizationContactSchema>;

/* * */

import { SchoolSchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/* * */

export const SchoolsListItemSchema = SchoolSchema.pick({
	_id: true,
	artistic: true,
	basic_1: true,
	basic_2: true,
	basic_3: true,
	created_at: true,
	created_by: true,
	grouping: true,
	high_school: true,
	municipality_id: true,
	municipality_name: true,
	name: true,
	other: true,
	pre_school: true,
	professional: true,
	special: true,
	updated_at: true,
	updated_by: true,
	university: true,
});

/* * */

/**
 * A read model for the alert list item.
 */
export type SchoolsListItem = z.infer<typeof SchoolsListItemSchema>;

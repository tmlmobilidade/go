/* * */

import { z } from 'zod';

/* * */

export const ChangelogItemCategoryValues = ['new_feature', 'improvement', 'bug_fix'] as const;
export const ChangelogItemCategorySchema = z.enum(ChangelogItemCategoryValues);

export type ChangelogItemCategory = z.infer<typeof ChangelogItemCategorySchema>;

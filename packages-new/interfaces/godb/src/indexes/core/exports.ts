/* * */

import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type FileExport } from '@tmlmobilidade/types';

/* * */

export const exportsIndexes: SimplifiedMongoIndex<FileExport>[] = [
	{ key: { updated_at: -1 } },
];

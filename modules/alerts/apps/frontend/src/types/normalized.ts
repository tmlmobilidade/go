/* * */

import { type Alert } from '@tmlmobilidade/types';

/* * */

export interface AlertNormalized extends Alert {
	description_normalized: string
	title_normalized: string
}

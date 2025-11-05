/* * */

import { type Alert } from '@go/types';

/* * */

export interface AlertNormalized extends Alert {
	description_normalized: string
	title_normalized: string
}

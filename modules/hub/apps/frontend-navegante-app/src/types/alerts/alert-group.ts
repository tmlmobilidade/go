/* * */

import { type Alert } from '@tmlmobilidade/types';

/**
 * Represents a group of alerts.
 */
export interface AlertGroup {
	items: Alert[]
	label?: string
	title: string
	value: string
}

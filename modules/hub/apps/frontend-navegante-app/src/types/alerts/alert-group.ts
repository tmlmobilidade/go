/* * */

import { type HubAlert } from '@tmlmobilidade/types';

/**
 * Represents a group of alerts.
 */
export interface AlertGroup {
	items: HubAlert[]
	label?: string
	title: string
	value: string
}

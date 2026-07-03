/* * */

import { type HubAlert } from '@tmlmobilidade/go-types-public-info';

/**
 * Represents a group of alerts.
 */
export interface AlertGroup {
	items: HubAlert[]
	label?: string
	title: string
	value: string
}

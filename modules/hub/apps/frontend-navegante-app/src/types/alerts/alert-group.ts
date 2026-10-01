/* * */

import { type HubV1ApiAlert } from '@tmlmobilidade/go-types-hub';

/**
 * Represents a group of alerts.
 */
export interface AlertGroup {
	items: HubV1ApiAlert[]
	label?: string
	title: string
	value: string
}

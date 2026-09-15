/* * */

import { type OperationalDate } from '@tmlmobilidade/go-types-shared'

/* * */

export interface DayTypeConfig {
	_id: string
	dates: OperationalDate[]
	day_type: '1' | '2' | '3'
	index: number
	name: string
	period: '1' | '2' | '3'
}
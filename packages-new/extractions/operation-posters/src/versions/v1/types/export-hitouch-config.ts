/* * */

import { PlanPostersContentMode, PlanPostersFilterMode } from '@tmlmobilidade/go-types-downloads';
import { type LinesMode } from '@tmlmobilidade/go-types-offer';
import { type OperationalDate } from '@tmlmobilidade/go-types-shared';

/* * */

export interface ExportHitouchConfig {
	canvas_profile: '0Master.A' | '0Master.B' | '0Master.C' | '0Master.F'
	content_mode: PlanPostersContentMode
	date_range: {
		end: OperationalDate
		start: OperationalDate
	}
	line_codes: string[]
	lines_mode?: LinesMode
	output: string
	source_has_calendar: boolean
	stop_ids: string[]
	stops_mode?: PlanPostersFilterMode
	workdir: string
}

/** Optional selection settings accepted before the export workspace is initialized. */
export type ExportHitouchOptions = Partial<Pick<ExportHitouchConfig, 'canvas_profile' | 'content_mode' | 'line_codes' | 'lines_mode' | 'stop_ids' | 'stops_mode'>>;

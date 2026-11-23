/* * */

import { type OperationPostersV1ExtractionProperties } from '@tmlmobilidade/go-types-extractions';
import { type OperationalDate } from '@tmlmobilidade/go-types-shared';

/* * */

export interface ExportHitouchConfig {
	canvas_profile: OperationPostersV1ExtractionProperties['canvas_profile']
	content: OperationPostersV1ExtractionProperties['content']
	date_range: {
		end: OperationalDate
		start: OperationalDate
	}
	filter_mode?: OperationPostersV1ExtractionProperties['filter_mode']
	output: string
	source_has_calendar: boolean
	stop_ids: string[]
	workdir: string
}

/** Optional selection settings accepted before the export workspace is initialized. */
export type ExportHitouchOptions = Partial<Pick<ExportHitouchConfig, 'canvas_profile' | 'content' | 'filter_mode' | 'stop_ids'>>;

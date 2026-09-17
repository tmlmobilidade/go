/* * */

import {
	type OperationPostersV1Agency,
	type OperationPostersV1CalendarAssignmentsExt,
	type OperationPostersV1CalendarDates,
	type OperationPostersV1CalendarExt,
	type OperationPostersV1Calendars,
	type OperationPostersV1DayTypesExt,
	type OperationPostersV1FeedInfo,
	type OperationPostersV1Routes,
	type OperationPostersV1RoutesToCanvasExt,
	type OperationPostersV1Shapes,
	type OperationPostersV1ShapesExt,
	type OperationPostersV1Stops,
	type OperationPostersV1StopTimes,
	type OperationPostersV1StopTimesExt,
	type OperationPostersV1StopToCanvasExt,
	type OperationPostersV1Trips,
} from '@tmlmobilidade/go-types-operation';
import { type BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { type GtfsStrictV30SQLTables } from '@tmlmobilidade/import-gtfs';

/* * */

export type OperationPostersV1Tables = GtfsStrictV30SQLTables;

export interface OperationPostersV1Context {
	run_id: string
	workdir: {
		path: string
		remove: () => void
	}
	writers: {
		agency: BatchWriter<OperationPostersV1Agency>
		calendar_assignments_ext: BatchWriter<OperationPostersV1CalendarAssignmentsExt>
		calendar_dates: BatchWriter<OperationPostersV1CalendarDates>
		calendar_ext: BatchWriter<OperationPostersV1CalendarExt>
		calendars: BatchWriter<OperationPostersV1Calendars>
		day_types_ext: BatchWriter<OperationPostersV1DayTypesExt>
		feed_info: BatchWriter<OperationPostersV1FeedInfo>
		routes: BatchWriter<OperationPostersV1Routes>
		routes_to_canvas_ext: BatchWriter<OperationPostersV1RoutesToCanvasExt>
		shapes: BatchWriter<OperationPostersV1Shapes>
		shapes_ext: BatchWriter<OperationPostersV1ShapesExt>
		stop_times: BatchWriter<OperationPostersV1StopTimes>
		stop_times_ext: BatchWriter<OperationPostersV1StopTimesExt>
		stops: BatchWriter<OperationPostersV1Stops>
		stops_to_canvas_ext: BatchWriter<OperationPostersV1StopToCanvasExt>
		trips: BatchWriter<OperationPostersV1Trips>
	}
}

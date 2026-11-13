/* * */

import { type Agency, type CalendarAssignmentsExt, type CalendarDates, type Calendars, type DayTypesExt, type Routes, type RoutesToCanvasExt, type Shapes, type ShapesExt, type Stops, type StopTimes, type StopToCanvasExt, type Trips } from '@tmlmobilidade/go-types-gtfs-hitouch';
import { type BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { type GtfsStrictV30SQLTables } from '@tmlmobilidade/go-utils-import-gtfs';

/* * */

export type OperationPostersV1Tables = GtfsStrictV30SQLTables;

export interface OperationPostersV1Context {
	run_id: string
	workdir: {
		path: string
		remove: () => void
	}
	writers: {
		agency: BatchWriter<Agency>
		calendar_assignments_ext: BatchWriter<CalendarAssignmentsExt>
		calendar_dates: BatchWriter<CalendarDates>
		calendars: BatchWriter<Calendars>
		day_types_ext: BatchWriter<DayTypesExt>
		routes: BatchWriter<Routes>
		routes_to_canvas_ext: BatchWriter<RoutesToCanvasExt>
		shapes: BatchWriter<Shapes>
		shapes_ext: BatchWriter<ShapesExt>
		stop_times: BatchWriter<StopTimes>
		stops: BatchWriter<Stops>
		stops_to_canvas_ext: BatchWriter<StopToCanvasExt>
		trips: BatchWriter<Trips>
	}
}

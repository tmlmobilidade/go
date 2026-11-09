package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: [location_group_id, stop_id, location_id]
  - Presence: Conditionally Forbidden, Conditionally Required, Conditionally Forbidden
  - Type: Foreign ID referencing location_groups.location_group_id, Foreign ID referencing stops.stop_id, Foreign ID referencing id from locations.geojson

# Description

  - location_group_id: Identifies a group of stops at which riders can request pickup or drop-off. Every serviced
    group must appear in stop_times.txt, ordered by the sequence in which service is available.
  - stop_id: Identifies the serviced stop or platform in stops.txt, with location_type=0 or empty. A trip can serve
    the same stop more than once.
  - location_id: Identifies a serviced GeoJSON location, as an alternative to a stop or location group.

Validation: Reports a populated location_group_id when stop_id or location_id is also populated on the same row.
This check does not resolve the group reference. Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func LocationGroupIdForbidden(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stop_times", []string{"location_group_id", "stop_id", "location_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "location_group_id")
		if err != nil {
			return err
		}

		//
		// 2. Get the location_group_id value

		if value == "" {
			return nil
		}

		//
		// 3. Check if the location_group_id is forbidden

		// These are values on the current stop_time, not IDs found elsewhere in the table.
		stopID, err := queries.Field(rowCtx.Source, "stop_id")
		if err != nil {
			return err
		}

		//
		// 4. Get the other location_id value

		otherLocation, err := queries.Field(rowCtx.Source, "location_id")
		if err != nil {
			return err
		}

		//
		// 5. Check if the location_group_id is forbidden

		if stopID != "" || otherLocation != "" {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "forbidden"))
		}

		//
		// 6. Return success

		return nil
	})
}

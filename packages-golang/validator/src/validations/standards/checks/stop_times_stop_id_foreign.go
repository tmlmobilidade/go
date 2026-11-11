package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
# Attributes

  - File: [stop_times.txt], [stops.txt]
  - Field: stop_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing stops.stop_id

# Description

Identifies the serviced stop or platform in stops.txt, with location_type=0 or empty. A trip can serve the same
stop more than once.

Conditionally Required:
- Required if `stop_times.location_group_id` AND `stop_times.location_id` are NOT defined.
- Forbidden if `stop_times.location_group_id` or `stop_times.location_id` are defined.

Validation: Checks that each non-empty stop_id exists in stops.stop_id. It compares the original text without
trimming whitespace or normalizing letter case. The presence of the referenced value is separate from its format.
Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard stop_times].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard stop_times]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func StopIdForeign(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "stop_times", "stops")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "stop_times", []string{"stop_id"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "stop_id")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if the stop_id is foreign

		referenceExists1, err := queries.Exists(&sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "stops"}, "stop_id", value)
		if err != nil {
			return err
		}
		if !referenceExists1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_found", value))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}

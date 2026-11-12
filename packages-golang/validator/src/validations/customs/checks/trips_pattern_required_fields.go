package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: [pattern_id, shape_id, route_id, direction_id, trip_headsign]
  - Presence: Configurable, Conditionally Required, Required, Optional, Optional
  - Type: ID, Foreign ID referencing shapes.shape_id, Foreign ID referencing routes.route_id, Enum, Text

# Description

Requires the fields used to characterize a populated TML pattern.

Validation: When pattern_id is populated, checks shape_id, route_id, direction_id and trip_headsign for empty
strings in that order. Only the first missing field is reported per trip. Whitespace-only values count as
populated. A missing pattern_id skips this check; formats, reference existence and group consistency are checked
separately.

The comparison is skipped when this rule is configured as forbidden. Unavailable source or lookup tables skip the
check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [trips.txt].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
*/
func PatternRequiredFields(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Read each pattern member once and preserve its source row
	return context.ForEachRow(ctx, "trips", []string{"pattern_id", "shape_id", "route_id", "direction_id", "trip_headsign"}, func(row *contextTypes.ValidationContext) error {
		values, err := queries.Fields(row.Source, "pattern_id", "shape_id", "route_id", "direction_id", "trip_headsign")
		if err != nil {
			return err
		}
		if values["pattern_id"] == "" || context.ShouldSkip(row) {
			return nil
		}

		//
		// 2. Keep the legacy field order and emit at most one finding per member
		for _, field := range []string{"shape_id", "route_id", "direction_id", "trip_headsign"} {
			if values[field] != "" {
				continue
			}
			switch field {
			case "shape_id":
				context.AddMessage(row, context.GetTranslatedMessage(row, "shape_id_not_found"))
			case "route_id":
				context.AddMessage(row, context.GetTranslatedMessage(row, "route_id_not_found"))
			case "direction_id":
				context.AddMessage(row, context.GetTranslatedMessage(row, "direction_id_not_found"))
			case "trip_headsign":
				context.AddMessage(row, context.GetTranslatedMessage(row, "trip_headsign_not_found"))
			}
			break
		}
		return nil
	})
}

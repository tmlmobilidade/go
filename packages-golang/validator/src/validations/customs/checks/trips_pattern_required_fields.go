package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

// PatternRequiredFields reports the first missing pattern attribute on each trip.
func PatternRequiredFields(ctx *context.ValidationContext) error {
	//
	// 1. Read each pattern member once and preserve its source row
	return context.ForEachRow(ctx, "trips", []string{"pattern_id", "shape_id", "route_id", "direction_id", "trip_headsign"}, func(row *context.ValidationContext) error {
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

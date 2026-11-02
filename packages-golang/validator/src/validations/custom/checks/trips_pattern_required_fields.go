package custom

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
)

/*
# Attributes

  - File: trips.txt
  - Field: pattern_id
  - Presence: Required
  - Type: ID

# Description

Validates if trips with the same pattern_id have the same route_id, trip_headsign, direction_id, shape_id and the same stop sequence.
*/
func PatternRequiredFields(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_pattern_required_fields"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("pattern_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Check if the pattern_id validation should run

	if ctx.ShouldSkip() {
		return nil
	}

	//
	// 4. Collect pattern_id values for the pattern_id group

	return validationutils.ForGroupFields(db, "pattern_id", []string{"shape_id", "route_id", "direction_id", "trip_headsign"}, func(row *services.SQLiteRow, fields map[string]string) error {
		for _, field := range []string{"shape_id", "route_id", "direction_id", "trip_headsign"} {
			if fields[field] == "" {
				rowCtx := lib.NewValidationContext("pattern_id", "trips.txt", ruleID, row.Row, services.AppMessageService)
				if rules != nil {
					rowCtx.WithSeverity(rules.Severity)
				}
				switch field {
				case "shape_id":
					rowCtx.AddMessageWithSeverity(rowCtx.GetTranslatedMessage("shape_id_not_found"))
				case "route_id":
					rowCtx.AddMessageWithSeverity(rowCtx.GetTranslatedMessage("route_id_not_found"))
				case "direction_id":
					rowCtx.AddMessageWithSeverity(rowCtx.GetTranslatedMessage("direction_id_not_found"))
				case "trip_headsign":
					rowCtx.AddMessageWithSeverity(rowCtx.GetTranslatedMessage("trip_headsign_not_found"))
				}
				break
			}
		}
		return nil
	})
}

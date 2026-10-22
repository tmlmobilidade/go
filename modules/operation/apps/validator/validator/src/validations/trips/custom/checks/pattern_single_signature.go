package trips_custom

import (
	"main/lib"
	"main/services"
	"main/types"
	trips_utils "main/validations/trips/utils"
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
func PatternSingleSignature(db *services.SQLiteContext, rules *types.RuleContext, hashes map[int]string) error {
	const ruleID = "trips_pattern_id_single_trip_signature_per_pattern"
	ctx := lib.NewValidationContext("pattern_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	if ctx.ShouldSkip() {
		return nil
	}
	pattern, err := db.Trips.Field("pattern_id")
	if err != nil {
		return err
	}
	signatures := map[string]bool{}
	err = trips_utils.ForGroup(db, "pattern_id", func(row *services.SQLiteRow) error { signatures[hashes[row.Row]] = true; return nil })
	if err != nil {
		return err
	}
	if len(signatures) > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("multiple_stop_sequence_variations", pattern))
	}
	return nil
}

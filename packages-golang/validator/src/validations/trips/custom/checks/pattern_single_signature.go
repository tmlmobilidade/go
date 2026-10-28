package trips_custom

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	trips_utils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/trips/utils"
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
func PatternSingleSignature(db *services.SQLiteContext, rules *types.RuleContext, hashes map[int]string) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_pattern_single_signature"

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
	// 4. Get the pattern_id value

	pattern, err := db.Trips.Field("pattern_id")
	if err != nil {
		return err
	}

	//
	// 5. Collect the stop sequence signatures for this pattern

	signatures := map[string]bool{}

	//
	// 6. Collect pattern_id values for the pattern_id group

	err = trips_utils.ForGroup(db, "pattern_id", func(row *services.SQLiteRow) error { signatures[hashes[row.Row]] = true; return nil })
	if err != nil {
		return err
	}

	//
	// 7. Check the pattern_id multiple stop sequence variations

	if len(signatures) > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("multiple_stop_sequence_variations", pattern))
	}

	//
	// 8. Return success

	return nil
}

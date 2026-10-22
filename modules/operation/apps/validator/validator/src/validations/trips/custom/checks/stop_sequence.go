package trips_custom

import (
	"main/lib"
	"main/services"
	"main/types"
	trips_utils "main/validations/trips/utils"
)

// StopSequence validates ordered stop tuples and records the signature consumed by pattern checks.
func StopSequence(db *services.SQLiteContext, rules *types.RuleContext, hashes map[int]string) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_stop_sequence"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("stop_sequence", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Check if the stop_sequence validation should run

	if ctx.ShouldSkip() {
		return nil
	}

	//
	// 4. Get the trip_id value

	trip, err := db.Trips.Field("trip_id")
	if err != nil {
		return err
	}

	//
	// 5. Skip empty stop_sequence values

	if trip == "" {
		return nil
	}

	//
	// 6. Get the trip stop sequence and its diagnostic result

	points, diagnostic, err := trips_utils.StopSequence(db, trip)
	if err != nil {
		return err
	}

	//
	// 7. Check the stop_sequence diagnostic result

	switch diagnostic {
	case "invalid":
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid"))
		return nil
	case "invalid_shape_dist":
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid_shape_dist"))
		return nil
	}

	//
	// 8. Check the stop_sequence values

	for i, point := range points {
		if i == 0 {
			continue
		}
		previous := points[i-1]
		if point.Sequence <= previous.Sequence {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("non_increasing_sequence", trip))
			return nil
		}
		if point.Distance >= 0 && previous.Distance >= 0 && point.Distance < previous.Distance {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("non_increasing_shape_dist", trip))
			return nil
		}
		if point.Stop != "" && point.Stop == previous.Stop {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("consecutive_stop_ids", point.Stop, trip))
			return nil
		}
	}

	//
	// 9. Store the stop sequence hash for this row

	hashes[db.Row] = trips_utils.SequenceHash(points)

	//
	// 10. Return success

	return nil
}

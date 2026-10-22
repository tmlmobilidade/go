package trips_custom

import (
	"main/lib"
	"main/services"
	"main/types"
	trips_utils "main/validations/trips/utils"
)

// StopSequence validates ordered stop tuples and records the signature consumed by pattern checks.
func StopSequence(db *services.SQLiteContext, rules *types.RuleContext, hashes map[int]string) error {
	const ruleID = "trips_stop_sequence_increasing_by_one_along_trip"
	ctx := lib.NewValidationContext("stop_sequence", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	if ctx.ShouldSkip() {
		return nil
	}
	trip, err := db.Trips.Field("trip_id")
	if err != nil {
		return err
	}
	if trip == "" {
		return nil
	}
	points, diagnostic, err := trips_utils.StopSequence(db, trip)
	if err != nil {
		return err
	}
	switch diagnostic {
	case "invalid":
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid"))
		return nil
	case "invalid_shape_dist":
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid_shape_dist"))
		return nil
	}
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
	hashes[db.Row] = trips_utils.SequenceHash(points)
	return nil
}

package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/utils"
)

// StopSequence validates ordered stop tuples; pattern checks build their own signatures.
func StopSequence(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips", "stop_times")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "trips", []string{"stop_sequence", "trip_id"}, func(rowCtx *context.ValidationContext) error {
		//
		// 2. Check if the stop_sequence validation should run

		if context.ShouldSkip(rowCtx) {
			return nil
		}

		//
		// 3. Get the trip_id value

		trip, err := queries.Field(rowCtx.Source, "trip_id")
		if err != nil {
			return err
		}

		//
		// 4. Skip empty stop_sequence values

		if trip == "" {
			return nil
		}

		//
		// 5. Get the trip stop sequence and its diagnostic result

		points, diagnostic, err := validationutils.StopSequence(rowCtx, trip)
		if err != nil {
			return err
		}

		//
		// 6. Check the stop_sequence diagnostic result

		switch diagnostic {
		case "invalid":
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid"))
			return nil
		case "invalid_shape_dist":
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid_shape_dist"))
			return nil
		}

		//
		// 7. Check the stop_sequence values

		for i, point := range points {
			if i == 0 {
				continue
			}
			previous := points[i-1]
			if point.Sequence <= previous.Sequence {
				context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "non_increasing_sequence", trip))
				return nil
			}
			if point.Distance >= 0 && previous.Distance >= 0 && point.Distance < previous.Distance {
				context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "non_increasing_shape_dist", trip))
				return nil
			}
			if point.Stop != "" && point.Stop == previous.Stop {
				context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "consecutive_stop_ids", point.Stop, trip))
				return nil
			}
		}

		//
		// 8. Finish after validating the complete stop sequence

		//
		// 9. Return success

		return nil
	})
}

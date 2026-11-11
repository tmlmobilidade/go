package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [trips.txt], [stop_times.txt]
  - Field: [trips.trip_id, stop_times.stop_id, stop_times.stop_sequence, stop_times.shape_dist_traveled]
  - Presence: Required, Conditionally Required, Required, Optional
  - Type: Unique ID, Foreign ID referencing stops.stop_id, Non-negative integer, Non-negative float

# Description

Checks the ordered stop sequence, adjacent distances and repeated consecutive stops of each trip.

Validation: Skips trips with an empty trip_id. The sequence reader reports unreadable integer sequences or
unreadable populated distances, then sorts usable rows numerically. For each adjacent pair, reports a
non-increasing sequence number, a decreasing distance when both are non-negative, or the same non-empty stop_id
twice in succession, in that order. Only the first diagnostic is emitted per trip. Gaps in sequence numbers and
equal distances pass. This check does not independently reject negative sequences, negative distances or non-finite
distances; empty distances are excluded from comparison.

Example: Sequences 1 and 3 with stops S1 and S2 and distances 0 and 0 pass; repeated sequence 1 or consecutive stop
S1 twice is reported.

The comparison is skipped when this rule is configured as forbidden. Unavailable source or lookup tables skip the
check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [trips.txt], [stop_times.txt].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
*/
func StopSequence(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips", "stop_times")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "trips", []string{"stop_sequence", "trip_id"}, func(rowCtx *contextTypes.ValidationContext) error {
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

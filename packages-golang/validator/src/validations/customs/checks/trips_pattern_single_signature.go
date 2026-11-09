package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [trips.txt], [stop_times.txt]
  - Field: [trips.pattern_id, trips.trip_id, stop_times.stop_id, stop_times.stop_sequence, stop_times.shape_dist_traveled]
  - Presence: Configurable, Required, Conditionally Required, Required, Optional
  - Type: ID, Unique ID, Foreign ID referencing stops.stop_id, Non-negative integer, Non-negative float

# Description

Requires the same ordered stop-sequence signature for trips sharing a non-empty pattern_id.

Validation: For each identified trip, reads and validates the sequence using the shared stop-sequence rules. A
usable sequence is signed from stop_id, parsed distance and numeric stop_sequence in sorted order. More than one
distinct signature in a pattern is reported. Differences in sequence numbers or distances matter even when the stop
identifiers match. Invalid sequences and missing trip identifiers use an empty signature, so several unusable trips
can compare equal. This check does not establish the validity of every sequence or compare route, direction,
headsign or shape values.

Example: Trips with stops S1 and S2 but sequence numbers 1,2 versus 1,3 have different signatures.

Rows with an empty pattern_id are not grouped. The comparison is skipped when this rule is configured as forbidden.
Unavailable source or lookup tables skip the check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [trips.txt], [stop_times.txt].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
*/
func PatternSingleSignature(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips", "stop_times")
	if err != nil || !ready {
		return err
	}
	hashes, err := validationutils.SequenceHashes(ctx)
	if err != nil {
		return err
	}

	return validationutils.ForEachGroup(ctx, "trips", "pattern_id", []string{"pattern_id"}, func(rowCtx *context.ValidationContext) error {
		//
		// 2. Check if the pattern_id validation should run

		if context.ShouldSkip(rowCtx) {
			return nil
		}

		//
		// 3. Get the pattern_id value

		pattern, err := queries.Field(rowCtx.Source, "pattern_id")
		if err != nil {
			return err
		}

		//
		// 4. Collect the stop sequence signatures for this pattern

		signatures := map[string]bool{}

		//
		// 5. Collect pattern_id values for the pattern_id group

		err = validationutils.ForGroup(rowCtx, "pattern_id", func(row *sqliteTypes.SQLiteRow) error { signatures[hashes[row.Row]] = true; return nil })
		if err != nil {
			return err
		}

		//
		// 6. Check the pattern_id multiple stop sequence variations

		if len(signatures) > 1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "multiple_stop_sequence_variations", pattern))
		}

		//
		// 7. Return success

		return nil
	})
}

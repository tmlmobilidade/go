package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
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

package custom

import (
	"strconv"
	"strings"

	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/utils"
)

/*
# Attributes
  - File: [trips.txt]
  - Field: direction_id
  - Presence: Required
  - Type: ID

# Description

Ensure the direction_id is consistent with the pattern_id (e.g., pattern_id "1001_0_1" should have direction_id = 0).
*/
func DirectionPatternIdMatch(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "trips", []string{"direction_pattern_id_match", "pattern_id", "direction_id"}, func(rowCtx *context.ValidationContext) error {
		//
		// 2. Get the pattern_id, direction_id values

		values, err := queries.Fields(rowCtx.Source, "pattern_id", "direction_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the direction_pattern_id_match validation should run

		if context.ShouldSkip(rowCtx) {
			return nil
		}

		//
		// 4. Skip empty direction_pattern_id_match values

		if values["pattern_id"] == "" || values["direction_id"] == "" {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "required"))
			return nil
		}

		//
		// 5. Convert the direction_id to an integer

		direction, err := strconv.Atoi(values["direction_id"])
		if err != nil {
			return nil
		} // Invalid integers belong to the direction check.

		//
		// 6. Split the pattern_id into its components

		parts := strings.Split(values["pattern_id"], "_")

		//
		// 7. Check if the direction_pattern_id_match is valid pattern id

		if len(parts) != 3 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid_pattern_id", values["pattern_id"]))
			return nil
		}

		//
		// 8. Convert the direction_pattern_id_match to an integer

		patternDirection, err := strconv.Atoi(parts[1])

		//
		// 9. Check if the direction_pattern_id_match is valid direction id

		if err != nil || patternDirection < 0 || patternDirection > 1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid_direction_id", parts[1]))
			return nil
		}

		//
		// 10. Check if direction_id matches the direction encoded in pattern_id

		if direction != patternDirection {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_matching", strconv.Itoa(direction), values["pattern_id"]))
		}

		//
		// 11. Return success

		return nil
	})
}

package custom

import (
	"strconv"
	"strings"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: [pattern_id, direction_id]
  - Presence: Configurable, Optional
  - Type: ID, Enum

# Description

Matches the trip direction with the middle component of its TML pattern identifier.

Validation: Reports a missing pattern_id or direction_id. An unreadable trip direction is left to its value check.
The pattern must have exactly three underscore-separated components, and the middle component must parse as 0 or 1.
That parsed number must equal the parsed trip direction. The first and last components are not otherwise validated;
this check does not independently enforce the trip direction domain.

Example: pattern_id=1001_0_1 requires direction_id=0; direction_id=01 is compared as the integer 1.

The comparison is skipped when this rule is configured as forbidden. Unavailable source or lookup tables skip the
check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [trips.txt].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
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

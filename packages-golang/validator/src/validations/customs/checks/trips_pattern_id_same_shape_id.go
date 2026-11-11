package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: [pattern_id, shape_id]
  - Presence: Configurable, Conditionally Required
  - Type: ID, Foreign ID referencing shapes.shape_id

# Description

Keeps the pattern identifier equal to the shape identifier on the same trip.

Validation: Skips comparison when either identifier is empty. Otherwise requires exact text equality, preserving
whitespace and letter case. It does not check whether the shape exists.

Example: pattern_id=1001_0_1 and shape_id=1001_0_1 pass.

The comparison is skipped when this rule is configured as forbidden. Unavailable source or lookup tables skip the
check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [trips.txt].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
*/
func PatternIdSameShapeId(ctx *types.ValidationContext) error {
	//

	//
	// 1. Select the fields needed for this comparison inside the rule

	return context.ForEachRow(ctx, "trips", []string{"pattern_id", "shape_id"}, func(row *types.ValidationContext) error {
		values, err := queries.Fields(row.Source, "pattern_id", "shape_id")
		if err != nil {
			return err
		}

		//
		// 2. Compare populated IDs using the scoped configuration

		if values["pattern_id"] == "" || values["shape_id"] == "" || context.ShouldSkip(row) {
			return nil
		}
		if values["pattern_id"] != values["shape_id"] {
			context.AddMessage(row, context.GetTranslatedMessage(row, "not_matching", values["pattern_id"], values["shape_id"]))
		}
		return nil
	})
}

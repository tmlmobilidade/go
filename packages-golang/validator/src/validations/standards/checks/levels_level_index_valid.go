package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"math"
	"strconv"
)

// LevelIndexValid preserves the existing non-negative float32 index rule.
func LevelIndexValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "levels", []string{"level_index"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "level_index")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty level_index values

		if value == "" {
			return nil
		}

		//
		// 3. Convert the level_index to a float

		parsed, err := strconv.ParseFloat(value, 32)
		if err != nil || math.IsNaN(parsed) || math.IsInf(parsed, 0) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 4. Check if the level_index is non-negative

		if parsed < 0 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", strconv.FormatFloat(parsed, 'f', -1, 32)))
		}

		//
		// 5. Return success

		return nil
	})
}

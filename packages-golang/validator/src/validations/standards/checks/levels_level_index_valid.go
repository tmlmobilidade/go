package standard

import (
	"math"
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [levels.txt]
  - Field: level_index
  - Presence: Required
  - Type: Float

# Description

Relative vertical position of the level. Ground level is 0, higher levels use positive values and underground
levels use negative values.

Validation: Checks for a finite number representable at the supported precision, then rejects negative values.
Unlike the GTFS field definition for underground levels, the current validator permits only non-negative indices.
Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[levels.txt]: https://gtfs.org/documentation/schedule/reference/#levelstxt
*/
func LevelIndexValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "levels", []string{"level_index"}, func(rowCtx *contextTypes.ValidationContext) error {
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

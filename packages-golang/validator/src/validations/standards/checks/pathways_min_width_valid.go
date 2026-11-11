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

  - File: [pathways.txt]
  - Field: min_width
  - Presence: Optional
  - Type: Positive float

# Description

Minimum pathway width in meters. Providing this field is recommended when the width is below one meter.

Validation: Checks that min_width is a finite, non-negative number. Negative values receive the negative-width
message; values below one meter, including zero, receive the recommendation message. This does not measure the
actual pathway. Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
*/
func MinWidthValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "pathways", []string{"min_width"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "min_width")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty min_width values

		if value == "" {
			return nil
		}

		//
		// 3. Convert the min_width to a float

		parsed, err := strconv.ParseFloat(value, 64)
		if err != nil || math.IsNaN(parsed) || math.IsInf(parsed, 0) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 4. Check if the min_width is non-negative

		if parsed < 0 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "negative"))
			return nil
		}

		//
		// 5. Check if the min_width needs a recommendation

		if parsed < 1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "recommended"))
		}

		//
		// 6. Return success

		return nil
	})
}

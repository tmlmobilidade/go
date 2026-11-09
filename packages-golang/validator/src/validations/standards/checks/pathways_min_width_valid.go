package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"math"
	"strconv"
)

/*
# Attributes
- File: [pathways.txt]
- Field: min_width
- Presence: optional
- Type: positive float

# Description

Minimum width of the pathway in meters.

This field is recommended if the minimum width is less than 1 meter.

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/
func MinWidthValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "pathways", []string{"min_width"}, func(rowCtx *context.ValidationContext) error {
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

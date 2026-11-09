package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"math"
	"strconv"
)

func StopLatValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"stop_lat"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "stop_lat")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Convert the stop_lat to a float

		number, err := strconv.ParseFloat(value, 64)
		if err != nil || math.IsNaN(number) || math.IsInf(number, 0) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 3. Check if the stop_lat is a valid latitude

		if !validators.ValidateLatitude(number) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}

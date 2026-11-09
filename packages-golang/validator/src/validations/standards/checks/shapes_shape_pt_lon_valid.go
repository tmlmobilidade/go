package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"strconv"
)

func ShapePtLonValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "shapes", []string{"shape_pt_lon"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "shape_pt_lon")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Transform the value to a float

		number, parseErr := strconv.ParseFloat(value, 64)
		if parseErr != nil {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 3. Check if the shape_pt_lon is valid

		if !validators.ValidateLongitude(number) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}

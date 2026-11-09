package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"slices"
)

func WheelchairBoardingValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"wheelchair_boarding"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "wheelchair_boarding")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if the wheelchair_boarding is valid

		validValues := []string{"0", "1", "2"}
		if !slices.Contains(validValues, value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}

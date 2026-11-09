package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"slices"
)

func HasTariffsInformationValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"has_tariffs_information"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "has_tariffs_information")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if the has_tariffs_information is valid

		validValues := []string{"0", "1", "2", "3"}
		if !slices.Contains(validValues, value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}

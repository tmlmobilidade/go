package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func StopAccessDifferenteLocationTypeZero(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"stop_access", "location_type"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		valueToValidate, err := queries.Field(rowCtx.Source, "stop_access")
		if err != nil {
			return err
		}
		if valueToValidate == "" {
			return nil
		}

		//
		// 2. Get the location_type value

		locationType, err := queries.Field(rowCtx.Source, "location_type")
		if err != nil {
			return err
		}

		//
		// 3. Check if the location_type is 0

		if locationType != "0" {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "forbidden"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}

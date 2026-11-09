package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func StopAccessForbiddenParentStation(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"stop_access", "parent_station"}, func(rowCtx *context.ValidationContext) error {
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
		// 2. Get the parent_station value

		parentStation, err := queries.Field(rowCtx.Source, "parent_station")
		if err != nil {
			return err
		}

		//
		// 3. Check if the parent_station is empty

		if parentStation == "" {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "forbidden"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}

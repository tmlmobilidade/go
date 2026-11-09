package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func StopDescDifferentStopName(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"stop_desc", "stop_name"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "stop_desc")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Get the stop_name value

		stopName, err := queries.Field(rowCtx.Source, "stop_name")
		if err != nil {
			return err
		}

		//
		// 3. Check if the stop_desc is different from the stop_name

		if value == stopName {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "duplicate", value, stopName))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}

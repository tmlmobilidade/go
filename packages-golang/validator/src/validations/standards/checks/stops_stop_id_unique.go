package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func StopIdUnique(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"stop_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		//
		// 2. Get the stop_id value

		value, count, err := queries.FieldWithCount(rowCtx.Source, "stop_id")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 3. Check if the stop_id is unique

		if count > 1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "duplicate", value))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}

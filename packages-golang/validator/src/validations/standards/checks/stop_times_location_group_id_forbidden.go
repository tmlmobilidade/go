package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func LocationGroupIdForbidden(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stop_times", []string{"location_group_id", "stop_id", "location_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "location_group_id")
		if err != nil {
			return err
		}

		//
		// 2. Get the location_group_id value

		if value == "" {
			return nil
		}

		//
		// 3. Check if the location_group_id is forbidden

		// These are values on the current stop_time, not IDs found elsewhere in the table.
		stopID, err := queries.Field(rowCtx.Source, "stop_id")
		if err != nil {
			return err
		}

		//
		// 4. Get the other location_id value

		otherLocation, err := queries.Field(rowCtx.Source, "location_id")
		if err != nil {
			return err
		}

		//
		// 5. Check if the location_group_id is forbidden

		if stopID != "" || otherLocation != "" {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "forbidden"))
		}

		//
		// 6. Return success

		return nil
	})
}

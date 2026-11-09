package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func RiderCategoryIdUnique(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "rider_categories", []string{"rider_category_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "rider_category_id")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty rider_category_id values

		// Presence belongs to the field check.
		if value == "" {
			return nil
		}

		//
		// 3. Count matching rider_category_id values

		_, count, err := queries.FieldWithCount(rowCtx.Source, "rider_category_id")
		if err != nil {
			return err
		}

		//
		// 4. Check if the rider_category_id is unique

		if count > 1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "duplicate", value))
		}

		//
		// 5. Return success

		return nil
	})
}

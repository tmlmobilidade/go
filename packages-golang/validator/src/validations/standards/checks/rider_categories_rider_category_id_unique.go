package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [rider_categories.txt]
  - Field: rider_category_id
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a rider category.

Validation: Checks that each non-empty rider_category_id occurs only once in rider_categories.txt. It compares the
original text without trimming whitespace or normalizing letter case. Empty values are skipped; required-field
checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[rider_categories.txt]: https://gtfs.org/documentation/schedule/reference/#rider_categoriestxt
*/
func RiderCategoryIdUnique(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "rider_categories", []string{"rider_category_id"}, func(rowCtx *contextTypes.ValidationContext) error {
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

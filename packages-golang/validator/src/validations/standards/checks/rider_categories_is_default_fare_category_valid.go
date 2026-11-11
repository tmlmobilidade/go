package standard

import (
	"slices"
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	variables "github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
)

/*
# Attributes

  - File: [rider_categories.txt]
  - Field: is_default_fare_category
  - Presence: Required
  - Type: Enum

# Description

Marks the default rider category with 1; 0 or empty means another category. Each fare product with multiple
eligible categories must have exactly one eligible default category.

Validation: Checks that the populated value represents an integer in 0, 1. Matching uses the parsed integer rather
than its original spelling. Configured options can further restrict this set; all_options bypasses that
restriction, while an empty list rejects all populated values. Empty values are skipped; required-field checks
handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[rider_categories.txt]: https://gtfs.org/documentation/schedule/reference/#rider_categoriestxt
*/
func IsDefaultFareCategoryValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "rider_categories", []string{"is_default_fare_category"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}
		config := &rowCtx.Config

		value, err := queries.Field(rowCtx.Source, "is_default_fare_category")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty is_default_fare_category values

		// Presence belongs to the field check.
		if value == "" {
			return nil
		}

		//
		// 3. Convert the is_default_fare_category to an integer

		parsed, err := strconv.Atoi(value)
		if err != nil {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid"))
			return nil
		}

		//
		// 4. Get the valid is_default_fare_category options

		validOptions := []int{0, 1}

		//
		// 5. Check if the is_default_fare_category is a valid option

		if !slices.Contains(validOptions, parsed) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid"))
			return nil
		}

		//
		// 6. Check the configured is_default_fare_category options

		if config.Options != nil && !slices.Contains(*config.Options, variables.AllRuleOptions) && !slices.Contains(*config.Options, strconv.Itoa(parsed)) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_allowed", strconv.Itoa(parsed)))
		}

		//
		// 7. Return success

		return nil
	})
}

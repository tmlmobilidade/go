package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	variables "github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
	"slices"
	"strconv"
)

func IsDefaultFareCategoryValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "rider_categories", []string{"is_default_fare_category"}, func(rowCtx *context.ValidationContext) error {
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

package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"slices"
	"strconv"
)

func IsDefaultFareCategoryValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "rider_categories_is_default_fare_category_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("is_default_fare_category", "rider_categories.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the is_default_fare_category value

	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.RiderCategories.Field("is_default_fare_category")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty is_default_fare_category values

	// Presence belongs to the field check.
	if value == "" {
		return nil
	}

	//
	// 5. Convert the is_default_fare_category to an integer

	parsed, err := strconv.Atoi(value)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid"))
		return nil
	}

	//
	// 6. Get the valid is_default_fare_category options

	validOptions := []int{0, 1}

	//
	// 7. Check if the is_default_fare_category is a valid option

	if !slices.Contains(validOptions, parsed) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid"))
		return nil
	}

	//
	// 8. Check the configured is_default_fare_category options

	if rules != nil && rules.Options != nil && !slices.Contains(*rules.Options, types.ALL_OPTIONS) && !slices.Contains(*rules.Options, strconv.Itoa(parsed)) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", strconv.Itoa(parsed)))
	}

	//
	// 9. Return success

	return nil
}

package rider_categories_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
)

func IsDefaultFareCategoryValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "rider_categories_at_most_one_default_fare_category"
	ctx := lib.NewValidationContext("is_default_fare_category", "rider_categories.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.RiderCategories.Field("is_default_fare_category")
	if err != nil {
		return err
	}
	// Presence belongs to the field check.
	if value == "" {
		return nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid"))
		return nil
	}
	validOptions := []int{0, 1}
	if !slices.Contains(validOptions, parsed) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid"))
		return nil
	}
	if rules != nil && rules.Options != nil && !slices.Contains(*rules.Options, types.ALL_OPTIONS) && !slices.Contains(*rules.Options, strconv.Itoa(parsed)) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", strconv.Itoa(parsed)))
	}
	return nil
}

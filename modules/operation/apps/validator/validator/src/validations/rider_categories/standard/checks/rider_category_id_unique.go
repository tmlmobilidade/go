package rider_categories_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func RiderCategoryIdUnique(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "rider_category_id_unique"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("rider_category_id", "rider_categories.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the rider_category_id value

	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.RiderCategories.Field("rider_category_id")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty rider_category_id values

	// Presence belongs to the field check.
	if value == "" {
		return nil
	}

	//
	// 5. Count matching rider_category_id values

	_, count, err := db.RiderCategories.FieldWithCount("rider_category_id")
	if err != nil {
		return err
	}

	//
	// 6. Check if the rider_category_id is unique

	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value))
	}

	//
	// 7. Return success

	return nil
}

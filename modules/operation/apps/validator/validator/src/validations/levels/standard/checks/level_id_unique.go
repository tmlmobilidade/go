package levels_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func LevelIdUnique(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "levels_level_id_unique"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("level_id", "levels.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the level_id value

	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.Levels.Field("level_id")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty level_id values

	// Presence belongs to the field check.
	if value == "" {
		return nil
	}

	//
	// 5. Count matching level_id values

	_, count, err := db.Levels.FieldWithCount("level_id")
	if err != nil {
		return err
	}

	//
	// 6. Check if the level_id is unique

	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value))
	}

	//
	// 7. Return success

	return nil
}

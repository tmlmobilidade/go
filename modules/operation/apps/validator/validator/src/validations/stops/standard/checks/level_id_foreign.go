package stops_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func LevelIdForeign(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_level_id_foreign"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("level_id", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the level_id value

	value, err := db.Stops.Field("level_id")
	if err != nil {
		return err
	}

	//
	// 4. Validate the level_id is a foreign key

	if !db.Levels.Exists("level_id", value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}

package fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func LevelIndexField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "levels_level_index_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("level_index", "levels.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the level_index value

	value, err := db.Levels.Field("level_index")
	if err != nil {
		return err
	}

	//
	// 4. Check if the level_index is required

	if value == "" {
		if ctx.ShouldIgnore() {
			return nil
		}

		ctx.AddMessageWithSeverity(ctx.GetSeverityMessage("required", "recommended", "informational"))
		return nil
	}

	//
	// 5. Return success

	return nil
}

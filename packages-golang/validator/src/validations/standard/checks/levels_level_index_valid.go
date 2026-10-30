package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"strconv"
)

// LevelIndexValid preserves the existing non-negative float32 index rule.
func LevelIndexValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "levels_level_index_valid"

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
	// 4. Skip empty level_index values

	if value == "" {
		return nil
	}

	//
	// 5. Convert the level_index to a float

	parsed, err := strconv.ParseFloat(value, 32)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 6. Check if the level_index is non-negative

	if parsed < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", strconv.FormatFloat(parsed, 'f', -1, 32)))
	}

	//
	// 7. Return success

	return nil
}

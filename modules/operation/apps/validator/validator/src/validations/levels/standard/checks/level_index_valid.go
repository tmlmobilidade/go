package levels_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
)

// LevelIndexValid preserves the existing non-negative float32 index rule.
func LevelIndexValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "level_index_required"
	ctx := lib.NewValidationContext("level_index", "levels.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Levels.Field("level_index")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	parsed, err := strconv.ParseFloat(value, 32)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}
	if parsed < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", strconv.FormatFloat(parsed, 'f', -1, 32)))
	}
	return nil
}

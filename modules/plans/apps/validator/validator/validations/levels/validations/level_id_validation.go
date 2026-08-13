package levels

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [levels.txt]
- Field: level_id
- Presence: Required
- Type: Unique ID

# Description

Id of the level that can be referenced from stops.txt.

[levels.txt]: https://gtfs.org/schedule/reference/#levelstxt
*/
func LevelIdValidation(level *types.Levels, row int, gtfs types.Gtfs, rules *types.LevelsRules) {
	ctx := lib.NewValidationContext("level_id", "levels.txt", "level_id_unique", row, services.AppMessageService)
	if rules != nil && rules.LevelId.Severity != "" {
		ctx.WithSeverity(rules.LevelId.Severity)
	}

	if level.LevelId == nil || *level.LevelId == "" {
		if ctx.ShouldSkip() {
			return
		}
		message := ctx.GetTranslatedMessage("level_id_validation.required")
		ctx.AddMessageWithSeverity(message)
		return
	}

	rows, err := gtfs.GetRowsById("levels", *level.LevelId)
	if err == nil && len(rows) > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("level_id_validation.duplicate", map[string]interface{}{"level_id": *level.LevelId}))
		return
	}
}

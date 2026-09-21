package levels

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [levels.txt]
- Field: level_index
- Presence: Required
- Type: float

# Description

Numeric index of the level that indicates relative position of this level in relation to other levels (levels with higher indices are assumed to be located above levels with lower indices).

[levels.txt]: https://gtfs.org/schedule/reference/#levelstxt
*/
func LevelIndexValidation(level *types.Levels, row int, rules *types.LevelsRules) {
	ctx := lib.NewValidationContext("level_index", "levels.txt", "level_index_required", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.LevelIndex.Severity != "" {
		ctx.WithSeverity(rules.LevelIndex.Severity)
	}

	if level.LevelIndex == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("level_index_validation.required"))
		return
	}
}

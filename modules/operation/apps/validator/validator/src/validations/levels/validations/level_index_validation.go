package levels

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
)

/*
# Attributes

- File: [levels.txt]
- Field: level_index
- Presence: Required
- Type: Non-negative float

# Description

Numeric index of the level that indicates relative position of this level in relation to other levels (levels with higher indices are assumed to be located above levels with lower indices).

[levels.txt]: https://gtfs.org/schedule/reference/#levelstxt
*/
func LevelIndexValidation(level *types.Levels, row int, rules *types.LevelsRules) {
	ctx := lib.NewValidationContext("level_index", "levels.txt", "level_index_required", row, services.AppMessageService)
	if rules != nil && rules.LevelIndex.Severity != "" {
		ctx.WithSeverity(rules.LevelIndex.Severity)
	}

	// 1. Validate level_index is present
	if level.LevelIndex == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate level_index is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate level_index is a valid level_index
	if *level.LevelIndex < 0 {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", strconv.FormatFloat(float64(*level.LevelIndex), 'f', -1, 32)))
		return
	}
}

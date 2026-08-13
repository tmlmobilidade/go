package levels

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [levels.txt]
- Field: level_name
- Presence: optional
- Type: Text

# Description

Name of the level as seen by the rider inside the building or station.
Example: Take the elevator to "Mezzanine" or "Platform" or "-1".

[levels.txt]: https://gtfs.org/schedule/reference/#levelstxt
*/
func LevelNameValidation(level *types.Levels, row int, rules *types.LevelsRules) {
	ctx := lib.NewValidationContext("level_name", "levels.txt", "level_name", row, services.AppMessageService)
	if rules != nil && rules.LevelName.Severity != "" {
		ctx.WithSeverity(rules.LevelName.Severity)
	}

	if level.LevelName == nil {
		if ctx.ShouldSkip() {
			return
		}
		message := ctx.GetRequiredMessage("level_name_validation.required", "level_name_validation.recommended")
		ctx.AddMessageWithSeverity(message)
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("level_name_validation.forbidden"))
		return
	}
}

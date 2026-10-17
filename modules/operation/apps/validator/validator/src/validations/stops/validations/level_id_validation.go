package stops

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: level_id
  - Presence: Optional
  - Type: Foreign ID referencing levels.level_id

# Description

Level of the location. The same level may be used by multiple unlinked stations.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func LevelIdValidation(stop *types.Stop, row int, gtfs types.Gtfs, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("level_id", "stops.txt", "stops_level_id_valid_id", row, services.AppMessageService)
	if rules != nil && rules.LevelId.Severity != "" {
		ctx.WithSeverity(rules.LevelId.Severity)
	}

	// 1. Validate level_id is present
	if stop.LevelId == nil || *stop.LevelId == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate level_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate level_id is a valid foreign key
	if !lib.GtfsIdMapKeyExists(&gtfs, "levels", *stop.LevelId) {
		ctx.AddError(ctx.GetTranslatedMessage("not_found", *stop.LevelId))
		return
	}

	// 4. Validate Rule options
	if rules != nil && rules.LevelId.Options != nil {
		if slices.Contains(*rules.LevelId.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.LevelId.Options, *stop.LevelId) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", *stop.LevelId))
			return
		}
	}
}

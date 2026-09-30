package pathways

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
)

/*
# Attributes

- File: [pathways.txt]
- Field: pathway_mode
- Presence: Required
- Type: Enum

# Description

Indicates the mode of transportation used in the pathway.

Valid options are:

  - 1: Walkway
  - 2: Stairs
  - 3: Moving sidewalk travelator
  - 4: Escalator
  - 5: Elevator
  - 6: Fare payment gate
  - 7: Exit gate

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/

func PathwayModeValidation(pathways *types.Pathways, row int, rules *types.PathwaysRules) {
	ctx := lib.NewValidationContext("pathway_mode", "pathways.txt", "pathway_mode_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.PathwayMode.Severity != "" {
		ctx.WithSeverity(rules.PathwayMode.Severity)
	}

	// 1. Validate pathway_mode is present
	if pathways.PathwayMode == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("pathway_mode_validation.required", "pathway_mode_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate pathway_mode is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("pathway_mode_validation.forbidden"))
		return
	}

	// 3. Validate pathway_mode is a valid pathway_mode
	validOptions := []int{1, 2, 3, 4, 5, 6, 7}
	if !slices.Contains(validOptions, *pathways.PathwayMode) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("pathway_mode_validation.invalid", strconv.Itoa(*pathways.PathwayMode)))
		return
	}

	// 4. Validate Rule Options
	if rules != nil && rules.PathwayMode.Options != nil {
		if slices.Contains(*rules.PathwayMode.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.PathwayMode.Options, strconv.Itoa(*pathways.PathwayMode)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("pathway_mode_validation.not_allowed", strconv.Itoa(*pathways.PathwayMode)))
			return
		}
	}
}

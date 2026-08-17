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
- Field: is_bidirectional
- Presence: Required
- Type: Enum

# Description

Indicates whether the pathway is bidirectional.

Valid options are:

  0 - Unidirectional pathway that can only be used from from_stop_id to to_stop_id.
  1 - Bidirectional pathway that can be used in both directions.

Exit gates (pathway_mode=7) must not be bidirectional.

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/

func IsBidirectionalValidation(pathways *types.Pathways, row int, rules *types.PathwaysRules) {
	ctx := lib.NewValidationContext("is_bidirectional", "pathways.txt", "pathway_is_bidirectional_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.IsBidirectional.Severity != "" {
		ctx.WithSeverity(rules.IsBidirectional.Severity)
	}

	if pathways.IsBidirectional == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("is_bidirectional_validation.required"))
		return
	}

	validOptions := []int{0, 1}
	if !slices.Contains(validOptions, *pathways.IsBidirectional) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("is_bidirectional_validation.invalid", *pathways.IsBidirectional))
		return
	}

	// Validate Rule Options
	if rules != nil && rules.IsBidirectional.Options != nil {
		if slices.Contains(*rules.IsBidirectional.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.IsBidirectional.Options, strconv.Itoa(*pathways.IsBidirectional)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("is_bidirectional_validation.not_allowed", *pathways.IsBidirectional))
			return
		}
	}

	// Check Exit Gate Bidirectional
	if *pathways.IsBidirectional == 1 && *pathways.PathwayMode == 7 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("is_bidirectional_validation.exit_gate_bidirectional"))
		return
	}
}

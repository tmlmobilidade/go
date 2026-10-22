package pathways_standard

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
func PathwayModeValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "pathway_mode_valid_gtfs_enum"
	ctx := lib.NewValidationContext("pathway_mode", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Pathways.Field("pathway_mode")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil || !slices.Contains([]int{1, 2, 3, 4, 5, 6, 7}, parsed) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}
	if rules != nil && rules.Options != nil {
		if slices.Contains(*rules.Options, types.ALL_OPTIONS) {
			return nil
		}
		if !slices.Contains(*rules.Options, strconv.Itoa(parsed)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", strconv.Itoa(parsed)))
			return nil
		}
	}
	return nil
}

package pathways_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
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
	//

	//
	// 1. Get the rule

	const ruleID = "pathways_pathway_mode_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("pathway_mode", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the pathway_mode value

	value, err := db.Pathways.Field("pathway_mode")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty pathway_mode values

	if value == "" {
		return nil
	}

	//
	// 5. Convert the pathway_mode to an integer

	parsed, err := strconv.Atoi(value)

	//
	// 6. Check if the pathway_mode is a valid option

	if err != nil || !slices.Contains([]int{1, 2, 3, 4, 5, 6, 7}, parsed) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 7. Check the configured pathway_mode options

	if rules != nil && rules.Options != nil {
		if slices.Contains(*rules.Options, types.ALL_OPTIONS) {
			return nil
		}
		if !slices.Contains(*rules.Options, strconv.Itoa(parsed)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", strconv.Itoa(parsed)))
			return nil
		}
	}

	//
	// 8. Return success

	return nil
}

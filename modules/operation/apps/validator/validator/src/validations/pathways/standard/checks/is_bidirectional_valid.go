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
func IsBidirectionalValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "pathway_is_bidirectional_valid_gtfs_enum"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("is_bidirectional", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the is_bidirectional value

	value, err := db.Pathways.Field("is_bidirectional")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty is_bidirectional values

	if value == "" {
		return nil
	}

	//
	// 5. Convert the is_bidirectional to an integer

	parsed, err := strconv.Atoi(value)

	//
	// 6. Check if the is_bidirectional is a valid option

	if err != nil || !slices.Contains([]int{0, 1}, parsed) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 7. Check the configured is_bidirectional options

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
	// 8. Get the pathway_mode value

	modeValue, err := db.Pathways.Field("pathway_mode")
	if err != nil {
		return err
	}

	//
	// 9. Convert the pathway_mode to an integer

	mode, err := strconv.Atoi(modeValue)

	//
	// 10. Check if the exit gate is bidirectional

	if err == nil && parsed == 1 && mode == 7 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("exit_gate_bidirectional"))
	}

	//
	// 11. Return success

	return nil
}

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
	const ruleID = "pathway_is_bidirectional_valid_gtfs_enum"
	ctx := lib.NewValidationContext("is_bidirectional", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Pathways.Field("is_bidirectional")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil || !slices.Contains([]int{0, 1}, parsed) {
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
	modeValue, err := db.Pathways.Field("pathway_mode")
	if err != nil {
		return err
	}
	mode, err := strconv.Atoi(modeValue)
	if err == nil && parsed == 1 && mode == 7 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("exit_gate_bidirectional"))
	}
	return nil
}

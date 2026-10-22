package pathways_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [pathways.txt]
- Field: pathway_id
- Presence: Required
- Type:  unique ID

# Description

Identifies a pathway. Used by systems as an internal identifier for the record. Must be unique in the dataset.

Different pathways may have the same values for from_stop_id and to_stop_id.
Example: When two escalators are side-by-side in opposite directions, or when a stair set and elevator go from the same place to the same place, different pathway_id may have the same from_stop_id and to_stop_id values.

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/
func PathwayIdValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "pathway_id_unique"
	ctx := lib.NewValidationContext("pathway_id", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Pathways.Field("pathway_id")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	_, count, err := db.Pathways.FieldWithCount("pathway_id")
	if err != nil {
		return err
	}
	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value))
	}
	return nil
}

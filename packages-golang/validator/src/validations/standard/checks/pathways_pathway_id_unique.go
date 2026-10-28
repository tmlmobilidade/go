package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
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
func PathwayIdUnique(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "pathways_pathway_id_unique"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("pathway_id", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the pathway_id value

	value, err := db.Pathways.Field("pathway_id")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty pathway_id values

	if value == "" {
		return nil
	}

	//
	// 5. Count matching pathway_id values

	_, count, err := db.Pathways.FieldWithCount("pathway_id")
	if err != nil {
		return err
	}

	//
	// 6. Check if the pathway_id is unique

	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value))
	}

	//
	// 7. Return success

	return nil
}

package pathways

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
func PathwayIdValidation(pathways *types.Pathways, row int, gtfs *types.Gtfs, rules *types.PathwaysRules) {
	ctx := lib.NewValidationContext("pathway_id", "pathways.txt", "pathway_id_unique", row, services.AppMessageService)
	if rules != nil && rules.PathwayId.Severity != "" {
		ctx.WithSeverity(rules.PathwayId.Severity)
	}

	// 1. Validate pathway_id is present
	if pathways.PathwayId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate pathway_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate pathway_id is a valid pathway_id
	rows, err := gtfs.GetRowsById("pathways", *pathways.PathwayId)
	if err == nil && len(rows) > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", *pathways.PathwayId))
		return
	}
}

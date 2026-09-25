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
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.PathwayId.Severity != "" {
		ctx.WithSeverity(rules.PathwayId.Severity)
	}

	if pathways.PathwayId == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("pathway_id_validation.required"))
		return
	}

	rows, err := gtfs.GetRowsById("pathways", *pathways.PathwayId)
	if err == nil && len(rows) > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("pathway_id_validation.duplicate", *pathways.PathwayId))
		return
	}
}

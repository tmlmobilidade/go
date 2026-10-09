package fare_attributes

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: fare_id
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a fare class.

[fare_attributes.txt]: https://gtfs.org/schedule/reference/#fare_attributestxt
*/
func FareIdValidation(fareAttribute *types.FareAttribute, row int, gtfs *types.Gtfs, rules *types.FareAttributesRules) {
	ctx := lib.NewValidationContext("fare_id", "fare_attributes.txt", "fare_attributes_id_unique", row, services.AppMessageService)
	if rules != nil && rules.FareId.Severity != "" {
		ctx.WithSeverity(rules.FareId.Severity)
	}

	// 1. Validate fare_id is present
	if fareAttribute.FareId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate fare_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate fare_id is unique
	rows, err := gtfs.GetRowsById("fare_attributes", *fareAttribute.FareId)
	if err == nil && len(rows) > 1 {
		ctx.AddError(ctx.GetTranslatedMessage("duplicate", *fareAttribute.FareId))
		return
	}
}

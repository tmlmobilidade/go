package fare_rules

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [fare_rules.txt]
  - Field: fare_id
  - Presence: Required
  - Type: Foreign ID referencing [fare_attributes.fare_id]

# Description

Identifies a fare class.

[fare_rules.txt]: https://gtfs.org/schedule/reference/#fare_rulestxt
[fare_attributes.fare_id]: https://gtfs.org/schedule/reference/#fare_attributestxt
*/
func FareIdValidation(fareRule *types.FareRule, row int, gtfs *types.Gtfs, rules *types.FareRulesRules) {
	ctx := lib.NewValidationContext("fare_id", "fare_rules.txt", "fare_rule_fare_id_references_fare_attributes", row, services.AppMessageService)
	if rules != nil && rules.FareId.Severity != "" {
		ctx.WithSeverity(rules.FareId.Severity)
	}

	// 1. Validate fare_id is present
	if fareRule.FareId == nil {
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

	// 3. Validate fare_id is a valid fare_id
	if !lib.GtfsIdMapKeyExists(gtfs, "fare_attributes", *fareRule.FareId) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", *fareRule.FareId))
		return
	}
}

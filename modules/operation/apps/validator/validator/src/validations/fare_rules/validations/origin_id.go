package fare_rules

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [fare_rules.txt]
  - Field: origin_id
  - Presence: Optional
  - Type: Foreign ID referencing [stops.zone_id]

# Description

Identifies an origin zone. If a fare class has multiple origin zones, create a record in fare_rules.txt for each origin_id.

# Example

If fare class "b" is valid for all travel originating from either zone "2" or zone "8", the fare_rules.txt file would contain these records for the fare class:

	fare_id,...,origin_id
	b,...,2
	b,...,8

[fare_rules.txt]: https://gtfs.org/schedule/reference/#fare_rulestxt
[stops.zone_id]: https://gtfs.org/schedule/reference/#stopstxt
*/
func OriginIdValidation(fareRule *types.FareRule, row int, gtfs *types.Gtfs, rules *types.FareRulesRules) {
	ctx := lib.NewValidationContext("origin_id", "fare_rules.txt", "fare_rule_origin_id_references_zones_stops", row, services.AppMessageService)
	if rules != nil && rules.OriginId.Severity != "" {
		ctx.WithSeverity(rules.OriginId.Severity)
	}

	// 1. Validate origin_id is present
	if fareRule.OriginId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate origin_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate origin_id is a valid origin_id
	if !lib.GtfsIdMapKeyExists(gtfs, "stops", *fareRule.OriginId) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", *fareRule.OriginId))
		return
	}
}

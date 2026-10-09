package fare_rules

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [fare_rules.txt]
  - Field: contains_id
  - Presence: Optional
  - Type: Foreign ID referencing [stops.zone_id]

# Description

Identifies the zones that a rider will enter while using a given fare class. Used in some systems to calculate correct fare class.

# Example

If fare class "c" is associated with all travel on the GRT route that passes through zones 5, 6, and 7 the fare_rules.txt would contain these records:

	fare_id,route_id,...,contains_id
	c,GRT,...,5
	c,GRT,...,6
	c,GRT,...,7

Because all contains_id zones must be matched for the fare to apply, an itinerary that passes through zones 5 and 6 but not zone 7 would not have fare class "c". For more detail, see https://code.google.com/p/googletransitdatafeed/wiki/FareExamples in the GoogleTransitDataFeed project wiki.

[fare_rules.txt]: https://gtfs.org/schedule/reference/#fare_rulestxt
[stops.zone_id]: https://gtfs.org/schedule/reference/#stopstxt
*/
func ContainsIdValidation(fareRule *types.FareRule, row int, gtfs *types.Gtfs, rules *types.FareRulesRules) {
	ctx := lib.NewValidationContext("contains_id", "fare_rules.txt", "fare_rule_contains_id_references_zones_stops", row, services.AppMessageService)
	if rules != nil && rules.ContainsId.Severity != "" {
		ctx.WithSeverity(rules.ContainsId.Severity)
	}

	// 1. Validate contains_id is present
	if fareRule.ContainsId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate contains_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate contains_id is a valid contains_id
	if !lib.GtfsIdMapKeyExists(gtfs, "stops", *fareRule.ContainsId) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", *fareRule.ContainsId))
		return
	}

}

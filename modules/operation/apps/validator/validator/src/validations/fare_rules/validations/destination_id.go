package fare_rules

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [fare_rules.txt]
  - Field: destination_id
  - Presence: Optional
  - Type: Foreign ID referencing [stops.zone_id]

# Description

Identifies a destination zone. If a fare class has multiple destination zones, create a record in fare_rules.txt for each destination_id.

# Example

The destination_id and destination_id fields could be used together to specify that fare class "b" is valid for travel between zones 3 and 4, and for travel between zones 3 and 5, the fare_rules.txt file would contain these records for the fare class:

	fare_id,...,destination_id,destination_id
	b,...,3,4
	b,...,3,5

[fare_rules.txt]: https://gtfs.org/schedule/reference/#fare_rulestxt
[stops.zone_id]: https://gtfs.org/schedule/reference/#stopstxt
*/
func DestinationIdValidation(fareRule *types.FareRule, row int, gtfs *types.Gtfs, rules *types.FareRulesRules) {
	ctx := lib.NewValidationContext("destination_id", "fare_rules.txt", "fare_rule_destination_id_references_zones_stops", row, services.AppMessageService)
	if rules != nil && rules.DestinationId.Severity != "" {
		ctx.WithSeverity(rules.DestinationId.Severity)
	}

	// 1. Validate destination_id is present
	if fareRule.DestinationId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate destination_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate destination_id is a valid destination_id
	if !lib.GtfsIdMapKeyExists(gtfs, "stops", *fareRule.DestinationId) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", *fareRule.DestinationId))
		return
	}
}

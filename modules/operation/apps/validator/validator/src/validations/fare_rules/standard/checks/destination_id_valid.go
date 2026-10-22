package fare_rules_standard

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
func DestinationIdValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "fare_rule_destination_id_references_zones_stops"
	ctx := lib.NewValidationContext("destination_id", "fare_rules.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.FareRules.Field("destination_id")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	table, err := db.Table("stops")
	if err != nil {
		return err
	}
	exists, err := table.Exists("zone_id", value)
	if err != nil {
		return err
	}
	if !exists {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}
	return nil
}

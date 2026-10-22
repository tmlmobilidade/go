package fare_rules_standard

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
func OriginIdValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "fare_rule_origin_id_references_zones_stops"
	ctx := lib.NewValidationContext("origin_id", "fare_rules.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.FareRules.Field("origin_id")
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

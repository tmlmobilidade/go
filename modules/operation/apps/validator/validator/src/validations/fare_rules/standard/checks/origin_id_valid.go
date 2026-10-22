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
	//

	//
	// 1. Get the rule

	const ruleID = "fare_rule_origin_id_references_zones_stops"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("origin_id", "fare_rules.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the origin_id value

	value, err := db.FareRules.Field("origin_id")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty origin_id values

	if value == "" {
		return nil
	}

	//
	// 5. Get the stops table

	table, err := db.Table("stops")
	if err != nil {
		return err
	}

	//
	// 6. Check if the origin_id reference exists

	exists, err := table.Exists("zone_id", value)
	if err != nil {
		return err
	}

	//
	// 7. Report a missing origin_id reference

	if !exists {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 8. Return success

	return nil
}

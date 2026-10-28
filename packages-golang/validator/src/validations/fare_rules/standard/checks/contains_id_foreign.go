package fare_rules_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
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
func ContainsIdForeign(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "fare_rules_contains_id_foreign"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("contains_id", "fare_rules.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the contains_id value

	value, err := db.FareRules.Field("contains_id")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty contains_id values

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
	// 6. Check if the contains_id reference exists

	exists, err := table.Exists("zone_id", value)
	if err != nil {
		return err
	}

	//
	// 7. Report a missing contains_id reference

	if !exists {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 8. Return success

	return nil
}

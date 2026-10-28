package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
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
func FareIdForeign(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "fare_rules_fare_id_foreign"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("fare_id", "fare_rules.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the fare_id value

	value, err := db.FareRules.Field("fare_id")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty fare_id values

	if value == "" {
		return nil
	}

	//
	// 5. Get the fare_attributes table

	table, err := db.Table("fare_attributes")
	if err != nil {
		return err
	}

	//
	// 6. Check if the fare_id reference exists

	exists, err := table.Exists("fare_id", value)
	if err != nil {
		return err
	}

	//
	// 7. Report a missing fare_id reference

	if !exists {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 8. Return success

	return nil
}

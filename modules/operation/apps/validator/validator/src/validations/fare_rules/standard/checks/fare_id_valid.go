package fare_rules_standard

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
func FareIdValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "fare_rule_fare_id_references_fare_attributes"
	ctx := lib.NewValidationContext("fare_id", "fare_rules.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.FareRules.Field("fare_id")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	table, err := db.Table("fare_attributes")
	if err != nil {
		return err
	}
	exists, err := table.Exists("fare_id", value)
	if err != nil {
		return err
	}
	if !exists {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}
	return nil
}

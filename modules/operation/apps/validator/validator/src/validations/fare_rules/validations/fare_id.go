package fare_rules

import (
	"main/i18n"
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

	addMessage := func(msg string) {
		services.AppMessageService.AddMessage(types.Message{
			Field:    "fare_id",
			FileName: "fare_rules.txt",
			Rows:     []int{row},
			Message:  msg,
			Severity: types.SEVERITY_ERROR,
			RuleID:   "fare_rule_fare_id_references_fare_attributes",
		})
	}

	if fareRule.FareId == nil {
		addMessage(i18n.AppTranslator.Get("fare_id_validation.required"))
		return
	}

	// Check Foreign Key
	if !lib.GtfsIdMapKeyExists(gtfs, "fare_attributes", *fareRule.FareId) {
		addMessage(i18n.AppTranslator.Get("fare_id_validation.invalid"))
		return
	}
}

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
	s := types.SEVERITY_IGNORE
	if rules != nil && rules.OriginId.Severity != "" {
		s = rules.OriginId.Severity
	}

	addMessage := func(msg string, severity types.Severity) {
		services.AppMessageService.AddMessage(types.Message{
			Field:    "origin_id",
			FileName: "fare_rules.txt",
			Rows:     []int{row},
			Message:  msg,
			Severity: severity,
			RuleID:   "fare_rule_origin_id_references_zones_stops",
		})
	}

	if fareRule.OriginId == nil {

		if s == types.SEVERITY_IGNORE || s == types.SEVERITY_FORBIDDEN {
			return
		}

		warn := lib.IfThenElse(s == types.SEVERITY_WARNING, i18n.AppTranslator.Get("origin_id_validation.recommended"), i18n.AppTranslator.Get("origin_id_validation.required"))
		addMessage(warn, s)
		return
	}

	if s == types.SEVERITY_FORBIDDEN {
		addMessage(i18n.AppTranslator.Get("origin_id_validation.forbidden"), s)
		return
	}

	// Check Foreign Key
	if !lib.GtfsIdMapKeyExists(gtfs, "stops", *fareRule.OriginId) {
		addMessage(i18n.AppTranslator.Get("origin_id_validation.invalid"), types.SEVERITY_ERROR)
		return
	}
}

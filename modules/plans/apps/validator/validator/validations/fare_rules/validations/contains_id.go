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
	s := types.SEVERITY_IGNORE
	if rules != nil && rules.ContainsId.Severity != "" {
		s = rules.ContainsId.Severity
	}

	addMessage := func(msg string, severity types.Severity) {
		services.AppMessageService.AddMessage(types.Message{
			Field:    "contains_id",
			FileName: "fare_rules.txt",
			Rows:     []int{row},
			Message:  msg,
			Severity: severity,
			RuleID:   "fare_rule_contains_id_references_zones_stops",
		})
	}

	if fareRule.ContainsId == nil {
		if s == types.SEVERITY_IGNORE || s == types.SEVERITY_FORBIDDEN {
			return
		}

		warn := lib.IfThenElse(s == types.SEVERITY_WARNING, i18n.AppTranslator.Get("contains_id_validation.recommended"), i18n.AppTranslator.Get("contains_id_validation.required"))
		addMessage(warn, s)
		return
	}

	if s == types.SEVERITY_FORBIDDEN {
		addMessage(i18n.AppTranslator.Get("contains_id_validation.forbidden"), s)
		return
	}

	// Check Foreign Key
	if !lib.GtfsIdMapKeyExists(gtfs, "stops", *fareRule.ContainsId) {
		addMessage(i18n.AppTranslator.Get("contains_id_validation.invalid"), types.SEVERITY_ERROR)
		return
	}
}

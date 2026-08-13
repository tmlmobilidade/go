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
	s := types.SEVERITY_IGNORE
	if rules != nil && rules.DestinationId.Severity != "" {
		s = rules.DestinationId.Severity
	}

	addMessage := func(msg string, severity types.Severity) {
		services.AppMessageService.AddMessage(types.Message{
			Field:    "destination_id",
			FileName: "fare_rules.txt",
			Rows:     []int{row},
			Message:  msg,
			Severity: severity,
			RuleID:   "fare_rule_destination_id_references_zones_stops",
		})
	}

	if fareRule.DestinationId == nil {

		if s == types.SEVERITY_IGNORE || s == types.SEVERITY_FORBIDDEN {
			return
		}

		warn := lib.IfThenElse(s == types.SEVERITY_WARNING, i18n.AppTranslator.Get("destination_id_validation.recommended"), i18n.AppTranslator.Get("destination_id_validation.required"))
		addMessage(warn, s)
		return
	}

	if s == types.SEVERITY_FORBIDDEN {
		addMessage(i18n.AppTranslator.Get("destination_id_validation.forbidden"), s)
		return
	}

	// Check Foreign Key
	if !lib.GtfsIdMapKeyExists(gtfs, "stops", *fareRule.DestinationId) {
		addMessage(i18n.AppTranslator.Get("destination_id_validation.invalid"), types.SEVERITY_ERROR)
		return
	}
}

package fare_rules

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/fare_rules/validations"
)

func init() {
	registry.Register("fare_rules", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	var section *types.FareRulesRules
	if rules != nil {
		section = &rules.FareRules
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	lib.AppLogger.Debug("Running FareRules Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "fare_rules", config.ProgressThresholdSmall)

	err := gtfs.IterateFareRules(func(i int, rawFareRule types.FareRuleRaw) error {
		tracker.Track()
		// Parse Fare Rule Validation
		fareRule := validations.ParseFareRule(rawFareRule, i)

		if fareRule == (types.FareRule{}) {
			return nil
		}

		var fareRulesRules *types.FareRulesRules
		if rules != nil {
			fareRulesRules = &rules.FareRules
		}

		// validate contains_id
		runner.Run(services.RuleActions{
			"fare_rule_contains_id_references_zones_stops":    func() { validations.ContainsIdValidation(&fareRule, i, &gtfs, fareRulesRules) },
			"fare_rule_destination_id_references_zones_stops": func() { validations.DestinationIdValidation(&fareRule, i, &gtfs, fareRulesRules) },
			"fare_rule_origin_id_references_zones_stops":      func() { validations.OriginIdValidation(&fareRule, i, &gtfs, fareRulesRules) },
			"fare_rule_fare_id_references_fare_attributes":    func() { validations.FareIdValidation(&fareRule, i, &gtfs, fareRulesRules) },
			"fare_rule_route_id_references_routes":            func() { validations.RouteIdValidation(&fareRule, i, &gtfs, fareRulesRules) },
		}, nil)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating fare rules: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed fare_rules.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}

package fare_rules

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/types"
	validations "main/validations/fare_rules/validations"
	registry "main/validations"
)

func init() {
	registry.Register("fare_rules", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
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
		validations.ContainsIdValidation(&fareRule, i, &gtfs, fareRulesRules)

		// validate destination_id
		validations.DestinationIdValidation(&fareRule, i, &gtfs, fareRulesRules)

		// validate origin_id
		validations.OriginIdValidation(&fareRule, i, &gtfs, fareRulesRules)

		// validate fare_id
		validations.FareIdValidation(&fareRule, i, &gtfs, fareRulesRules)

		// validate route_id
		validations.RouteIdValidation(&fareRule, i, &gtfs, fareRulesRules)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating fare rules: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed fare_rules.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}

package frequencies

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/frequencies/validations"
)

func init() {
	registry.Register("frequencies", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	var section *types.FrequenciesRules
	if rules != nil {
		section = &rules.Frequencies
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	lib.AppLogger.Debug("Running Frequencies Validations...")

	// Pre-compute frequencies per trip_id for performance
	// This avoids N+1 queries in trip_id validation
	lib.AppLogger.Debug("Pre-computing frequencies per trip_id...")
	frequencyTripIdCache := make(map[string][]types.FrequenciesRaw)

	err := gtfs.IterateFrequencies(func(i int, rawFrequency types.FrequenciesRaw) error {
		if rawFrequency.TripId == "" {
			return nil
		}
		frequencyTripIdCache[rawFrequency.TripId] = append(frequencyTripIdCache[rawFrequency.TripId], rawFrequency)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error pre-computing frequencies per trip_id: %v", err))
	}
	lib.AppLogger.Debug(fmt.Sprintf("Pre-computed frequencies for %d trips", len(frequencyTripIdCache)))

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "frequencies", config.ProgressThresholdSmall)

	err = gtfs.IterateFrequencies(func(i int, rawFrequency types.FrequenciesRaw) error {
		tracker.Track()

		parsedFrequency := validations.ParseFrequencies(&rawFrequency, i)

		var frequenciesRules *types.FrequenciesRules
		if rules != nil {
			frequenciesRules = &rules.Frequencies
		}

		// Validate trip_id
		runner.Run(services.RuleActions{
			"frequencies_trip_id_references_trips_table":                    func() { validations.TripIdValidation(parsedFrequency, i, &gtfs, frequenciesRules) },
			"frequency_end_time_valid":                                      func() { validations.EndTimeValidation(parsedFrequency, i, frequenciesRules) },
			"frequency_start_time_valid":                                    func() { validations.StartTimeValidation(parsedFrequency, i, frequenciesRules) },
			"frequencies_headway_secs_positive_and_aligns_trip":             func() { validations.HeadwaySecsValidation(parsedFrequency, i, frequenciesRules) },
			"frequencies_exact_times_zero_when_timed_trip_uses_frequencies": func() { validations.ExactTimesValidation(parsedFrequency, i, frequenciesRules) },
		}, nil)

		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating frequencies: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed frequencies.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}

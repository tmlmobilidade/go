package frequencies

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/types"
	registry "main/validations"
	validations "main/validations/frequencies/validations"
)

func init() {
	registry.Register("frequencies", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
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
		validations.TripIdValidation(parsedFrequency, i, &gtfs, frequenciesRules)

		// Validate end_time
		validations.EndTimeValidation(parsedFrequency, i, frequenciesRules)

		// Validate start_time
		validations.StartTimeValidation(parsedFrequency, i, frequenciesRules)

		// Validate headway_secs
		validations.HeadwaySecsValidation(parsedFrequency, i, frequenciesRules)

		// Validate exact_times
		validations.ExactTimesValidation(parsedFrequency, i, frequenciesRules)

		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating frequencies: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed frequencies.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}

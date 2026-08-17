package fare_media

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/types"
	registry "main/validations"
	validations "main/validations/fare_media/validations"
)

func init() {
	registry.Register("fare_media", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running FareMedia Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "fare_media", config.ProgressThresholdSmall)

	err := gtfs.IterateFareMedia(func(i int, rawFareMedia types.FareMediaRaw) error {
		tracker.Track()
		// Parse Fare Media Validation
		fareMedia := validations.ParseFareMedia(rawFareMedia, i)

		if fareMedia == (types.FareMedia{}) {
			return nil
		}

		var fareMediaRules *types.FareMediaRules
		if rules != nil {
			fareMediaRules = &rules.FareMedia
		}

		// Validate fare_media_id
		validations.FareMediaIdValidation(&fareMedia, i, &gtfs, fareMediaRules)

		// Validate fare_media_name
		validations.FareMediaNameValidation(&fareMedia, i, &gtfs, fareMediaRules)

		// Validate fare_media_type
		validations.FareMediaTypeValidation(&fareMedia, i, &gtfs, fareMediaRules)

		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating fare media: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed fare_media.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}

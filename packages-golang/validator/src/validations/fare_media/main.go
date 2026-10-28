package fare_media

import (
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/config"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	registry "github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	validations "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_media/validations"
	"main/types"
)

func init() {
	registry.Register("fare_media", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	runner, dagErr := services.NewRuleRunner(gtfs, rules, "fare_media")
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
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

		// Validate fare_media_id
		runner.Run(services.RuleActions{
			"fare_media_id_unique": func() {
				validations.FareMediaIdValidation(&fareMedia, i, &gtfs, rules.Rule("fare_media_id_unique"))
			},
			"fare_media_name_non_empty": func() {
				validations.FareMediaNameValidation(&fareMedia, i, &gtfs, rules.Rule("fare_media_name_non_empty"))
			},
			"fare_media_type_valid": func() {
				validations.FareMediaTypeValidation(&fareMedia, i, &gtfs, rules.Rule("fare_media_type_valid"))
			},
		}, nil)

		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating fare media: %v", err))
	} else {
		tracker.Complete()
		lib.AppLogger.Info(fmt.Sprintf("Completed fare_media.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}

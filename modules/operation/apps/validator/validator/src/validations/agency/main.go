package agency

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/agency/validations"
)

func init() {
	registry.Register("agency", RunValidations)
}

func RunValidations(gtfs types.Gtfs, gtfsRules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Validations for agency.txt")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "agency", config.ProgressThresholdSmall)

	var fileRules *types.AgencyRules
	if gtfsRules != nil {
		fileRules = &gtfsRules.Agency
	}
	runner, err := services.NewRuleRunner(gtfs, fileRules)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}

	err = gtfs.IterateAgencies(func(i int, rawAgency types.AgencyRaw) error {
		tracker.Track()
		// Parse Agency Validation
		agency := validations.ParseAgency(rawAgency, i)

		if agency == (types.Agency{}) {
			return nil
		}

		runner.Run(services.RuleActions{
			"agency_id_unique":                   func() { validations.AgencyIdValidation(&agency, i, gtfs, fileRules) },
			"agency_name_present":                func() { validations.AgencyNameValidation(&agency, i, fileRules) },
			"agency_id_matched_with_agency_name": func() { validations.AgencyNameIdMatchValidation(&agency, i, fileRules) },
			"agency_url_valid_url":               func() { validations.AgencyUrlValidation(&agency, i, fileRules) },
			"agency_timezone_valid_id":           func() { validations.AgencyTimezoneValidation(&agency, i, fileRules) },
			"agency_lang_valid_language_tag":     func() { validations.AgencyLangValidation(&agency, i, fileRules) },
			"agency_phone_valid_phone_number":    func() { validations.AgencyPhoneValidation(&agency, i, fileRules) },
			"agency_fare_url_valid_url":          func() { validations.AgencyFareUrlValidation(&agency, i, fileRules) },
			"agency_email_valid_address":         func() { validations.AgencyEmailValidation(&agency, i, fileRules) },
		}, nil)
		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating agencies: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed agency.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}

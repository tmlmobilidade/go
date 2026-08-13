package agency

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/types"
	registry "main/validations"
	validations "main/validations/agency/validations"
)

func init() {
	registry.Register("agency", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Validations for agency.txt")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "agency", config.ProgressThresholdSmall)

	err := gtfs.IterateAgencies(func(i int, rawAgency types.AgencyRaw) error {
		tracker.Track()
		// Parse Agency Validation
		agency := validations.ParseAgency(rawAgency, i)

		if agency == (types.Agency{}) {
			return nil
		}

		var agencyRules types.AgencyRules
		if rules != nil {
			agencyRules = rules.Agency
		}

		// Duplicate Agencies Validation
		validations.AgencyIdValidation(&agency, i, gtfs, &agencyRules)

		// Validate Agency Name
		validations.AgencyNameValidation(&agency, i, &agencyRules)

		// [CUSTOM VALIDATION] Check if agency_id matches agency_name
		validations.AgencyNameIdMatchValidation(&agency, i, &agencyRules)

		// Validate Agency URL
		validations.AgencyUrlValidation(&agency, i, &agencyRules)

		// Validate Agency Timezone
		validations.AgencyTimezoneValidation(&agency, i, &agencyRules)

		// Validate Agency Lang
		validations.AgencyLangValidation(&agency, i, &agencyRules)

		// Validate Agency Phone
		validations.AgencyPhoneValidation(&agency, i, &agencyRules)

		// Validate Agency Fare URL
		validations.AgencyFareUrlValidation(&agency, i, &agencyRules)

		// Validate Agency Email
		validations.AgencyEmailValidation(&agency, i, &agencyRules)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating agencies: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed agency.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}

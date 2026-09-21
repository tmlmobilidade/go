package agency

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/lib/rules"
	"main/types"
	registry "main/validations"
	validations "main/validations/agency/validations"
)

func init() {
	registry.Register("agency", RunValidations)
}

// agencyRow is the input every agency rule receives
type agencyRow struct {
	agency *types.Agency
	row    int
	gtfs   types.Gtfs
	rules  *types.AgencyRules
}

// agencyRules lists every agency rule. Dependencies come from depends_on in rules.json;
// the manager sorts the rules and skips a rule when a dependency fails.
var agencyRules = []rules.Rule[*agencyRow]{
	// Check if agency_id is unique
	{
		ID: "agency_id_unique",
		Run: func(r *agencyRow) rules.Status {
			return validations.AgencyIdValidation(r.agency, r.row, r.gtfs, r.rules)
		},
	},
	// Check if agency_name is present
	{
		ID: "agency_name_present",
		Run: func(r *agencyRow) rules.Status {
			return validations.AgencyNameValidation(r.agency, r.row, r.rules)
		},
	},
	// [CUSTOM VALIDATION] Check if agency_id matches agency_name
	{
		ID: "agency_id_matched_with_agency_name",
		Run: func(r *agencyRow) rules.Status {
			return validations.AgencyNameIdMatchValidation(r.agency, r.row, r.rules)
		},
	},
	// Check if agency_url is valid
	{
		ID: "agency_url_valid_url",
		Run: func(r *agencyRow) rules.Status {
			return validations.AgencyUrlValidation(r.agency, r.row, r.rules)
		},
	},
	// Check if agency_timezone is valid
	{
		ID: "agency_timezone_valid_id",
		Run: func(r *agencyRow) rules.Status {
			return validations.AgencyTimezoneValidation(r.agency, r.row, r.rules)
		},
	},
	// Check if agency_lang is valid
	{
		ID: "agency_lang_valid_language_tag",
		Run: func(r *agencyRow) rules.Status {
			return validations.AgencyLangValidation(r.agency, r.row, r.rules)
		},
	},
	// Check if agency_phone is valid
	{
		ID: "agency_phone_valid_phone_number",
		Run: func(r *agencyRow) rules.Status {
			return validations.AgencyPhoneValidation(r.agency, r.row, r.rules)
		},
	},
	// Check if agency_fare_url is valid
	{
		ID: "agency_fare_url_valid_url",
		Run: func(r *agencyRow) rules.Status {
			return validations.AgencyFareUrlValidation(r.agency, r.row, r.rules)
		},
	},
	// Check if agency_email is valid
	{
		ID: "agency_email_valid_address",
		Run: func(r *agencyRow) rules.Status {
			return validations.AgencyEmailValidation(r.agency, r.row, r.rules)
		},
	},
}

func RunValidations(gtfs types.Gtfs, gtfsRules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Validations for agency.txt")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "agency", config.ProgressThresholdSmall)

	var fileRules types.AgencyRules
	if gtfsRules != nil {
		fileRules = gtfsRules.Agency
	}

	// depends_on is already checked by the rules parser, so an error here is unexpected
	manager, err := rules.NewManager(rules.WithDependencies(agencyRules, rules.DependenciesFrom(fileRules))...)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error ordering agency rules: %v", err))
		return
	}

	err = gtfs.IterateAgencies(func(i int, rawAgency types.AgencyRaw) error {
		tracker.Track()
		// Parse Agency Validation
		agency := validations.ParseAgency(rawAgency, i)

		if agency == (types.Agency{}) {
			return nil
		}

		manager.RunRow(&agencyRow{agency: &agency, row: i, gtfs: gtfs, rules: &fileRules})
		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating agencies: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed agency.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}

package agency

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ParseAgency(rawAgency types.AgencyRaw, row int) types.Agency {
	var (
		agency                                                                                               types.Agency = types.Agency{}
		agencyName, agencyUrl, agencyTimezone, agencyId, agencyLang, agencyPhone, agencyFareUrl, agencyEmail string
		messages                                                                                             []types.Message
	)

	stringFields := map[string]*string{
		"agency_name":     &agencyName,
		"agency_url":      &agencyUrl,
		"agency_timezone": &agencyTimezone,
		"agency_id":       &agencyId,
		"agency_lang":     &agencyLang,
		"agency_phone":    &agencyPhone,
		"agency_fare_url": &agencyFareUrl,
		"agency_email":    &agencyEmail,
	}

	// Helper to collect error messages
	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:        field,
			FileName:     "agency.txt",
			Rows:         []int{row},
			Message:      msg,
			Severity:     types.SEVERITY_ERROR,
			RuleID:       "agency_values_parse",
		})
	}

	// Parse string fields
	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawAgency, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// If there are any errors, return an empty trip
	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return agency
	}

	// Required fields
	agency.AgencyName = lib.IfThenElse(agencyName != "", &agencyName, nil)
	agency.AgencyUrl = lib.IfThenElse(agencyUrl != "", &agencyUrl, nil)
	agency.AgencyTimezone = lib.IfThenElse(agencyTimezone != "", &agencyTimezone, nil)

	agency.AgencyId = lib.IfThenElse(rawAgency.AgencyId != "", &agencyId, nil)
	agency.AgencyLang = lib.IfThenElse(rawAgency.AgencyLang != "", &agencyLang, nil)
	agency.AgencyPhone = lib.IfThenElse(rawAgency.AgencyPhone != "", &agencyPhone, nil)
	agency.AgencyFareUrl = lib.IfThenElse(rawAgency.AgencyFareUrl != "", &agencyFareUrl, nil)
	agency.AgencyEmail = lib.IfThenElse(rawAgency.AgencyEmail != "", &agencyEmail, nil)

	return agency
}

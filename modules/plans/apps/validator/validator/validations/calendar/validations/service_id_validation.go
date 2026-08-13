package trips

import (
	"main/i18n"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: service_id
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a set of dates when service is available for one or more routes.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func ServiceIdValidation(calendar *types.Calendar, row int, gtfs *types.Gtfs) {

	message := types.Message{
		Field:    "service_id",
		FileName: "calendar.txt",
		Message:  "Service ID is required",
		Rows:     []int{row},
		Severity: types.SEVERITY_ERROR,
		RuleID:   "calendar_service_id_unique_non_empty",
	}

	if calendar.ServiceId != "" {
		// Check if service_id is Unique ID
		if gtfs.IdMap["calendar"] != nil && len(gtfs.IdMap["calendar"][calendar.ServiceId]) > 1 {
			message.Message = i18n.AppTranslator.Get("service_id_validation.duplicate", calendar.ServiceId)
			message.Severity = types.SEVERITY_ERROR
			services.AppMessageService.AddMessage(message)
		}

		return
	}

	services.AppMessageService.AddMessage(message)
}

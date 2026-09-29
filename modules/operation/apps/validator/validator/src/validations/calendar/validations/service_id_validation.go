package calendar

import (
	"main/lib"
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
	ctx := lib.NewValidationContext("service_id", "calendar.txt", "calendar_service_id_unique_non_empty", row, services.AppMessageService)

	// 1. Validate service_id is present
	if calendar.ServiceId == "" {
		ctx.AddError(ctx.GetTranslatedMessage("service_id_validation.required"))
		return
	}

	// 2. Validate service_id is unique
	rows, err := gtfs.GetRowsById("calendar", calendar.ServiceId)
	if err == nil && len(rows) > 1 {
		ctx.AddError(ctx.GetTranslatedMessage("service_id_validation.duplicate", calendar.ServiceId))
	}
}

package calendar_dates

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes
  - File: [calendar_dates.txt]
  - Field: service_id
  - Presence: Required
  - Type: Foreign ID referencing calendar.service_id or ID

# Description

Identifies a set of dates when a service exception occurs for one or more routes. Each (service_id, date) pair may only appear once in [calendar_dates.txt] if using [calendar.txt] and [calendar_dates.txt] in conjunction.

If a service_id value appears in both [calendar.txt] and [calendar_dates.txt], the information in [calendar_dates.txt] modifies the service information specified in [calendar.txt].

[calendar_dates.txt]: https://gtfs.org/schedule/reference/#calendar_datestxt
[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func ServiceIdValidation(db *services.SQLiteContext, rules *types.CalendarDatesRules) error {
	ctx := lib.NewValidationContext("service_id", "calendar_dates.txt", "calendar_dates_service_id_references_calendar", db.Row, services.AppMessageService)
	if rules != nil && rules.ServiceId.Severity != "" {
		ctx.WithSeverity(rules.ServiceId.Severity)
	}

	//
	// 1. Get the service_id value

	serviceId, err := db.CalendarDates.Field("service_id")
	if err != nil {
		return err
	}

	//
	// 2. Validate service_id is present

	if serviceId == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 3. Validate service_id is forbidden

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return nil
	}

	//
	// 4. Validate rules

	if rules != nil && rules.ServiceId.Options != nil {
		if slices.Contains(*rules.ServiceId.Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*rules.ServiceId.Options, serviceId) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", serviceId))
			return nil
		}
	}

	//
	// 5. Return success

	return nil
}

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
func ServiceIdValidation(db *services.SQLiteContext, rules *types.CalendarRules) error {

	ctx := lib.NewValidationContext("service_id", "calendar.txt", "calendar_service_id_unique_non_empty", db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule("calendar_service_id_unique_non_empty")
		ctx.WithSeverity(rule.Severity)
	}

	// 1. Get service_id and its occurrence count in calendar
	value, count, err := db.Calendar.FieldWithCount("service_id")
	if err != nil {
		return err
	}

	// 2. Validate service_id is present
	if value == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	// 3. Validate service_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return nil
	}

	// 4. Validate service_id is unique
	if count > 1 {
		ctx.AddError(ctx.GetTranslatedMessage("duplicate", value))
	}
	return nil
}

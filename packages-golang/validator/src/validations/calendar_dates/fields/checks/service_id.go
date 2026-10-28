package calendar_dates_fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
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
func ServiceIdField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "calendar_dates_service_id_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("service_id", "calendar_dates.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get service_id and its occurrence count in calendar_dates

	value, _, err := db.CalendarDates.FieldWithCount("service_id")
	if err != nil {
		return err
	}

	//
	// 4. Validate service_id is present

	if value == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetSeverityMessage("required", "recommended", "informational")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 5. Return success

	return nil
}

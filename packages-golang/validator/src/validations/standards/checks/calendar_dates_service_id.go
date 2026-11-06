package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
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
func CalendarDatesServiceIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "calendar_dates", []string{"service_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get service_id and its occurrence count in calendar_dates

		value, err := queries.Field(row.Source, "service_id")
		if err != nil {
			return err
		}

		//
		// 3. Validate service_id is present

		if value == "" {
			if context.ShouldSkip(row) {
				return nil
			}

			message := context.GetSeverityMessage(row, "required", "recommended", "informational")
			context.AddMessage(row, message)
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}

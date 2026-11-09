package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: service_id
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a set of dates on which one or more routes operate.

Validation: Checks that each non-empty service_id occurs only once in calendar.txt. It compares the original text
without trimming whitespace or normalizing letter case. Empty values are skipped; required-field checks handle
absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[calendar.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#calendartxt
*/
func ServiceIdUnique(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "calendar", []string{"service_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		//
		// 2. Get service_id and its occurrence count in calendar

		value, count, err := queries.FieldWithCount(rowCtx.Source, "service_id")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		// 3. Validate service_id is unique
		if count > 1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "duplicate", value))
		}

		// 4. Return success

		return nil
	})
}

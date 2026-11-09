package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes
  - File: [calendar_dates.txt]
  - Field: date
  - Presence: Required
  - Type: Date

# Description

Date when service exception occurs.
*/
func CalendarDatesDateValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "calendar_dates", []string{"date"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		date, err := queries.Field(rowCtx.Source, "date")
		if err != nil {
			return err
		}
		if date == "" {
			return nil
		}

		//
		// 2. Validate date is a valid service date

		if !validators.IsValidServiceDate(date) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", date))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}

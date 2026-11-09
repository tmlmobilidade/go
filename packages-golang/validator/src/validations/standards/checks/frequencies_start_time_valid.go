package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [frequencies.txt]
  - Field: start_time
  - Presence: Required
  - Type: Time

# Description

Departure time of the first vehicle from the trip's first stop for this headway interval.

Validation: Checks for eight characters and three integer components separated by colons. This format check does
not bound minutes or seconds and therefore accepts values such as 99:99:99. Empty values are skipped;
required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[frequencies.txt]: https://gtfs.org/documentation/schedule/reference/#frequenciestxt
*/
func StartTimeValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "frequencies", []string{"start_time"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "start_time")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty start_time values

		if value == "" {
			return nil
		}

		//
		// 3. Check if the start_time is a valid time

		if !validators.ValidateTime(value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 4. Return success

		return nil
	})
}

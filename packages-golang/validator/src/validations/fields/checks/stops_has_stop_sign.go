package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: has_stop_sign
  - Presence: Configurable
  - Type: Enum

# Description

TML extension recording the presence or status of stop sign at the stop. The value check accepts 0, 1, 2 and 3; the
published reference does not assign meanings to these codes.

This field is not defined by GTFS Standard and has no published presence requirement. Its presence is controlled by
the validation rule configuration.

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func HasStopSignField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stops", []string{"has_stop_sign"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the has_stop_sign value

		value, err := queries.Field(row.Source, "has_stop_sign")
		if err != nil {
			return err
		}

		//
		// 3. Check if the has_stop_sign is present

		if value == "" {
			if context.ShouldIgnore(row) {
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

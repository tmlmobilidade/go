package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_code
  - Presence: Optional
  - Type: Text

# Description

Short code displayed to riders for the location. It may match stop_id when that identifier is public-facing, and
should be empty if no code is shown to riders.

Presence and type follow [GTFS Standard].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func StopCodeField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stops", []string{"stop_code"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the stop_code value

		value, err := queries.Field(row.Source, "stop_code")
		if err != nil {
			return err
		}

		//
		// 3. Check if the stop_code is present

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

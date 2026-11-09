package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: location_type
  - Presence: Optional
  - Type: Enum

# Description

Type of location: 0 or empty for a stop/platform, 1 station, 2 entrance/exit, 3 generic node or 4 boarding area.

Presence and type follow [GTFS Standard].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func LocationTypeField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stops", []string{"location_type"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the location_type value

		value, err := queries.Field(row.Source, "location_type")
		if err != nil {
			return err
		}

		//
		// 3. Check if the location_type is present

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

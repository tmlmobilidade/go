package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_name
  - Presence: Conditionally Required
  - Type: Text

# Description

Public-facing name of the location as shown on timetables or signs. For a boarding area, use its displayed
designation. Translations belong in translations.txt.

Conditionally Required:
  - Required for locations which are stops (`location_type=0`), stations (`location_type=1`) or entrances/exits
    (`location_type=2`).
  - Optional for locations which are generic nodes (`location_type=3`) or boarding areas (`location_type=4`).

Presence and type follow [GTFS Standard].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func StopNameField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stops", []string{"stop_name"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the stop_name value

		value, err := queries.Field(row.Source, "stop_name")
		if err != nil {
			return err
		}

		//
		// 3. Check if the stop_name is present

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

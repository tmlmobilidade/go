package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: wheelchair_boarding
  - Presence: Optional
  - Type: Enum

# Description

Wheelchair boarding or access information. Values 1 and 2 indicate accessible and inaccessible respectively; 0 or
empty means unknown for parentless stops or inherited from the parent when applicable.

Presence and type follow [GTFS Standard].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func WheelchairBoardingField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stops", []string{"wheelchair_boarding"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the wheelchair_boarding value

		value, err := queries.Field(row.Source, "wheelchair_boarding")
		if err != nil {
			return err
		}

		//
		// 3. Check if the wheelchair_boarding is present

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

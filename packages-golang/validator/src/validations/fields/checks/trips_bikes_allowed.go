package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: bikes_allowed
  - Presence: Optional
  - Type: Enum

# Description

Bicycle carriage policy for the trip: 0 or empty for no information, 1 bicycles allowed or 2 bicycles not allowed.

Presence and type follow [GTFS Standard].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#tripstxt
*/
func BikesAllowedField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "trips", []string{"bikes_allowed"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the bikes_allowed value

		value, err := queries.Field(row.Source, "bikes_allowed")
		if err != nil {
			return err
		}

		//
		// 3. Check if the bikes_allowed is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			context.AddMessage(row, context.GetSeverityMessage(row, "required", "recommended", "informational"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}

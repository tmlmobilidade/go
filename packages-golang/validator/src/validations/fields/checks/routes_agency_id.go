package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: agency_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing agency.agency_id

# Description

Identifies the agency operating the route.

Conditionally Required:
- Required if multiple agencies are defined in agency.txt.
- Recommended otherwise.

Presence and type follow [GTFS Standard].

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#routestxt
*/
func RoutesAgencyIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "routes", []string{"agency_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the agency_id value

		value, err := queries.Field(row.Source, "agency_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the agency_id is required

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

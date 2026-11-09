package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: line_id
  - Presence: Required
  - Type: ID

# Description

Identifier grouping route variants into a line. This legacy TML extension is required by the v29 route schema.

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
*/
func LineIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "routes", []string{"line_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the line_id value

		value, err := queries.Field(row.Source, "line_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the line_id is required

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

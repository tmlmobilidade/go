package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: path_type
  - Presence: Optional
  - Type: Enum

# Description

Legacy TML route classification: 1 base path, 2 partial path or 3 variant path.

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
*/
func PathTypeField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "routes", []string{"path_type"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the path_type value

		value, err := queries.Field(row.Source, "path_type")
		if err != nil {
			return err
		}

		//
		// 3. Check if the path_type is required

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

package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [pathways.txt]
  - Field: pathway_id
  - Presence: Required
  - Type: Unique ID

# Description

Unique internal identifier for a pathway. Separate pathways can connect the same pair of locations.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
*/
func PathwayIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "pathways", []string{"pathway_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the pathway_id value

		value, err := queries.Field(row.Source, "pathway_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the pathway_id is required

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

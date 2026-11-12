package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [pathways.txt]
  - Field: pathway_mode
  - Presence: Required
  - Type: Enum

# Description

Type of connection: 1 walkway, 2 stairs, 3 moving sidewalk, 4 escalator, 5 elevator, 6 fare gate or 7 exit gate.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
*/
func PathwayModeField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "pathways", []string{"pathway_mode"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the pathway_mode value

		value, err := queries.Field(row.Source, "pathway_mode")
		if err != nil {
			return err
		}

		//
		// 3. Check if the pathway_mode is required

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

package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [pathways.txt]
  - Field: traversal_time
  - Presence: Optional
  - Type: Positive integer

# Description

Average positive number of seconds needed to travel from from_stop_id to to_stop_id. Recommended for moving
sidewalks, escalators and elevators, identified by pathway_mode values 3, 4 and 5.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
*/
func TraversalTimeField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "pathways", []string{"traversal_time"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the traversal_time value

		value, err := queries.Field(row.Source, "traversal_time")
		if err != nil {
			return err
		}

		//
		// 3. Check if the traversal_time is required

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

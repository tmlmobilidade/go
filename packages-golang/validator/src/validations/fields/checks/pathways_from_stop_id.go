package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [pathways.txt]
  - Field: from_stop_id
  - Presence: Required
  - Type: Foreign ID referencing stops.stop_id

# Description

Location where the pathway begins. It must reference a platform, entrance/exit, generic node or boarding area.
Stations and platforms with stop_access=1 must not be used.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
*/
func PathwaysFromStopIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "pathways", []string{"from_stop_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the from_stop_id value

		value, err := queries.Field(row.Source, "from_stop_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the from_stop_id is required

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

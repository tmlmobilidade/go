package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [pathways.txt]
  - Field: stair_count
  - Presence: Optional
  - Type: Non-null integer

# Description

Number of stairs along the pathway. A positive value means walking up from from_stop_id to to_stop_id; a negative
value means walking down. Recommended for pathway_mode=2.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
*/
func StairCountField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "pathways", []string{"stair_count"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the stair_count value

		value, err := queries.Field(row.Source, "stair_count")
		if err != nil {
			return err
		}

		//
		// 3. Check if the stair_count is required

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

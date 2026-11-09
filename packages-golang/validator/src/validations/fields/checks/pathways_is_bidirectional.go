package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [pathways.txt]
  - Field: is_bidirectional
  - Presence: Required
  - Type: Enum

# Description

Specifies a one-way pathway from from_stop_id to to_stop_id with 0, or a pathway usable in both directions with 1.
Exit gates with pathway_mode=7 must be one-way.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
*/
func IsBidirectionalField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "pathways", []string{"is_bidirectional"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the is_bidirectional value

		value, err := queries.Field(row.Source, "is_bidirectional")
		if err != nil {
			return err
		}

		//
		// 3. Check if the is_bidirectional is required

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

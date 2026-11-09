package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [pathways.txt]
  - Field: signposted_as
  - Presence: Optional
  - Type: Text

# Description

Public-facing text reproduced from the physical signs for the pathway. It can be used to provide directions to
riders.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
*/
func SignpostedAsField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "pathways", []string{"signposted_as"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the signposted_as value

		value, err := queries.Field(row.Source, "signposted_as")
		if err != nil {
			return err
		}

		//
		// 3. Check if the signposted_as is required

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

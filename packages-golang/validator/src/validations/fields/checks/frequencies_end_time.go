package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [frequencies.txt]
  - Field: end_time
  - Presence: Required
  - Type: Time

# Description

Time at the trip's first stop when this headway interval ends or changes to another interval.

[frequencies.txt]: https://gtfs.org/documentation/schedule/reference/#frequenciestxt
*/
func EndTimeField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "frequencies", []string{"end_time"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the end_time value

		value, err := queries.Field(row.Source, "end_time")
		if err != nil {
			return err
		}

		//
		// 3. Check if the end_time is required

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

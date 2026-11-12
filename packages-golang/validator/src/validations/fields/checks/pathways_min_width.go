package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [pathways.txt]
  - Field: min_width
  - Presence: Optional
  - Type: Positive float

# Description

Minimum pathway width in meters. Providing this field is recommended when the width is below one meter.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
*/
func MinWidthField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "pathways", []string{"min_width"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the min_width value

		value, err := queries.Field(row.Source, "min_width")
		if err != nil {
			return err
		}

		//
		// 3. Check if the min_width is required

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

package fields

import (
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [pathways.txt]
  - Field: length
  - Presence: Optional
  - Type: Non-negative float

# Description

Horizontal pathway length in meters between from_stop_id and to_stop_id. Recommended for walkways, fare gates and
exit gates, identified by pathway_mode values 1, 6 and 7.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
*/
func LengthField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "pathways", []string{"length", "pathway_mode"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the length value

		value, err := queries.Field(row.Source, "length")
		if err != nil {
			return err
		}

		//
		// 3. Check if the length is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			modeValue, err := queries.Field(row.Source, "pathway_mode")
			if err != nil {
				return err
			}
			mode, parseErr := strconv.Atoi(modeValue)
			if parseErr == nil && (mode == 1 || mode == 6 || mode == 7) {
				context.AddMessage(row, context.GetTranslatedMessage(row, "recommended"))
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

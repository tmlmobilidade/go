package fields

import (
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [pathways.txt]
  - Field: max_slope
  - Presence: Optional
  - Type: Float

# Description

Maximum slope ratio along the pathway: positive uphill, negative downhill or 0 or empty for no slope. Applicable to
walkways and moving sidewalks, identified by pathway_mode values 1 and 3.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
*/
func MaxSlopeField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "pathways", []string{"max_slope", "pathway_mode"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the max_slope value

		value, err := queries.Field(row.Source, "max_slope")
		if err != nil {
			return err
		}

		//
		// 3. Check if the max_slope is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			modeValue, err := queries.Field(row.Source, "pathway_mode")
			if err != nil {
				return err
			}
			mode, parseErr := strconv.Atoi(modeValue)
			if parseErr == nil && (mode == 1 || mode == 3) {
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

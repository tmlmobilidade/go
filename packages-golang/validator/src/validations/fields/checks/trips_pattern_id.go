package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: pattern_id
  - Presence: Configurable
  - Type: ID

# Description

TML extension grouping trips by a common operating pattern, including their route, direction, destination, shape
and stop sequence.

This field is not defined by GTFS Standard and has no published presence requirement. Its presence is controlled by
the validation rule configuration.

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
*/
func PatternIdField(ctx *types.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "trips", []string{"pattern_id"}, func(row *types.ValidationContext) error {
		//
		// 2. Read the current source value

		value, err := queries.Field(row.Source, "pattern_id")
		if err != nil {
			return err
		}

		//
		// 3. Report missing values using this context's configuration and rule ID

		if value == "" && !context.ShouldIgnore(row) {
			context.AddMessage(row, context.GetSeverityMessage(row, "required", "recommended", "informational"))
		}
		return nil
	})
}

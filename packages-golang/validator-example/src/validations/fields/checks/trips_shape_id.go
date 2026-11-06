package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/services/sqlite/queries"
)

// TripsShapeIdField checks its own source table using the context released by Kahn.
func TripsShapeIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "trips", []string{"shape_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Read the current source value

		value, err := queries.Field(row.Source, "shape_id")
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

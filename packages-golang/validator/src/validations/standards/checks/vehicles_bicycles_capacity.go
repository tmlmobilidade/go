package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func BicyclesCapacityField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "vehicles", []string{"bicycles_capacity"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the bicycles_capacity value

		value, err := queries.Field(row.Source, "bicycles_capacity")
		if err != nil {
			return err
		}

		//
		// 3. Check if the bicycles_capacity is required

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

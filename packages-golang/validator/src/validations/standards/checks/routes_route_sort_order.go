package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func RouteSortOrderField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "routes", []string{"route_sort_order"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the route_sort_order value

		value, err := queries.Field(row.Source, "route_sort_order")
		if err != nil {
			return err
		}

		//
		// 3. Check if the route_sort_order is required

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

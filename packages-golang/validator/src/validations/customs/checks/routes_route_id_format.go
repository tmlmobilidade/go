package custom

import (
	"fmt"

	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/utils"
)

func RouteIdFormat(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "routes")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "routes", []string{"route_id", "route_short_name", "route_sort_order"}, func(rowCtx *context.ValidationContext) error {
		//
		// 2. Get the values

		routeId, err := queries.Field(rowCtx.Source, "route_id")
		if err != nil {
			return err
		}

		routeShortName, err := queries.Field(rowCtx.Source, "route_short_name")
		if err != nil {
			return err
		}

		routeSortOrder, err := queries.Field(rowCtx.Source, "route_sort_order")
		if err != nil {
			return err
		}

		//
		// 3. Validate route_id is route_short_name and route_sort_order joined by an underscore

		expected := fmt.Sprintf("%s_%s", routeShortName, routeSortOrder)
		if routeId != expected {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", routeId, expected, routeShortName, routeSortOrder))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}

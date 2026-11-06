package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

func LineShortNameEqualRouteShortName(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "routes")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "routes", []string{"line_short_name", "route_short_name"}, func(rowCtx *context.ValidationContext) error {
		//
		// 2. Get the line_short_name value

		value, err := queries.Field(rowCtx.Source, "line_short_name")
		if err != nil {
			return err
		}

		//
		// 3. Check if the line_short_name is equal to the route_short_name

		routeShortName, err := queries.Field(rowCtx.Source, "route_short_name")
		if err != nil {
			return err
		}
		if value != routeShortName {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_equal_to_route_short_name", value, routeShortName))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}

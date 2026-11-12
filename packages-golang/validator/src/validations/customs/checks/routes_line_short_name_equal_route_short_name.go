package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: [line_short_name, route_short_name]
  - Presence: Required, Conditionally Required
  - Type: Text

# Description

Keeps the legacy TML line designation aligned with the route short name.

Validation: Compares line_short_name and route_short_name as exact text. Different values are reported. Two empty
fields pass; whitespace and letter case are not normalized. This rule does not check references or require either
field to be populated.

Example: line_short_name=1001 and route_short_name=1001 pass; line_short_name=1002 is reported for the same
route_short_name.

Unavailable source or lookup tables skip the check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [routes.txt].

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
*/
func LineShortNameEqualRouteShortName(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "routes")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "routes", []string{"line_short_name", "route_short_name"}, func(rowCtx *contextTypes.ValidationContext) error {
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

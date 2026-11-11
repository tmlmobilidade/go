package custom

import (
	"fmt"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: [route_id, route_short_name, route_sort_order]
  - Presence: Required, Conditionally Required, Optional
  - Type: Unique ID, Text, Non-negative integer

# Description

Builds the expected route identifier from its short name and sort order.

Validation: Requires route_id to equal route_short_name, one underscore and route_sort_order, in that order.
Components are used as raw text without trimming, numeric conversion or zero-padding. Empty components are still
included in the comparison. Uniqueness and numeric sort-order validity belong to other checks.

Example: route_short_name=1001 and route_sort_order=1 require route_id=1001_1.

Unavailable source or lookup tables skip the check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [routes.txt].

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
*/
func RouteIdFormat(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "routes")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "routes", []string{"route_id", "route_short_name", "route_sort_order"}, func(rowCtx *contextTypes.ValidationContext) error {
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

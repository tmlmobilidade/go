package routes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: route_sort_order
  - Presence: Optional
  - Type: Non-negative integer

# Description

Checks that each supplied route_sort_order is a non-negative base-ten integer.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
*/
func (RoutesChecks) RoutesRouteSortOrderValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "routes", "route_sort_order")
	}

	// 2. Check the format of supplied values
	return fields.CheckValues(ctx, db, config, "routes", "route_sort_order", "The route_sort_order field must be a non-negative base-ten integer.", validators.ValidateInteger)
}

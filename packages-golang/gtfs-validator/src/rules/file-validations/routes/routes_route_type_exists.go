package routes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: route_type
  - Presence: Required
  - Type: Enum

# Description

Requires the route_type column and a nonblank value on each row.
A missing table is handled by the file presence rule. Forbidden severity rejects supplied values.

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
*/
func (RoutesChecks) RoutesRouteTypeExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "routes", "route_type")
	}

	// 2. Check column and value presence
	return fields.CheckPresence(ctx, db, config, "routes", "route_type", true)
}

package routes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: route_id
  - Presence: Required
  - Type: Unique ID

# Description

Unimplemented. Check for duplicate route IDs. This placeholder always passes.

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
*/
func (RoutesChecks) RoutesRouteIDUnique(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Pass until this validation is implemented
	return true, nil, nil
}

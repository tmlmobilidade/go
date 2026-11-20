package routes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: route_desc, route_long_name
  - Presence: Optional
  - Type: Text

# Description

Unimplemented. Check that the route description differs from the long name. This placeholder always passes.

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
*/
func (RoutesChecks) RoutesRouteDescDifferentFromRouteLongName(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Pass until this validation is implemented
	return true, nil, nil
}

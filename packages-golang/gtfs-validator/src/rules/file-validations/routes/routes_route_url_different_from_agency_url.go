package routes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: route_url
  - Presence: Optional
  - Type: URL

# Description

Unimplemented. Compare the route URL with the corresponding agency URL. This placeholder always passes.

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
*/
func (RoutesChecks) RoutesRouteURLDifferentFromAgencyURL(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Pass until this validation is implemented
	return true, nil, nil
}

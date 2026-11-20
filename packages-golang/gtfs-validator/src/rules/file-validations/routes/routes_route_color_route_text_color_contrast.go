package routes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: route_color, route_text_color
  - Presence: Required in GTFS v30
  - Type: Color

# Description

Unimplemented. Check contrast between the route background and text colors. This placeholder always passes.

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
*/
func (RoutesChecks) RoutesRouteColorRouteTextColorContrast(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Pass until this validation is implemented
	return true, nil, nil
}

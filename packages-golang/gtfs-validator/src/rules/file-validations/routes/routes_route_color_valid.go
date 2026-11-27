package routes

import (
	"context"
	"database/sql"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: route_color
  - Presence: Required in GTFS v30
  - Type: Color

# Description

Checks that each supplied route_color is a six-digit hexadecimal color without a leading #.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
*/
func (RoutesChecks) RoutesRouteColorValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "routes", "route_color")
	}

	// 2. Check the format of supplied values
	return fields.CheckValues(ctx, db, config, "routes", "route_color", "The route_color field must be a six-digit hexadecimal color without a leading #.", func(value string) bool {
		if len(value) != 6 {
			return false
		}
		for _, digit := range value {
			if !strings.ContainsRune("0123456789ABCDEFabcdef", digit) {
				return false
			}
		}
		return true
	})
}

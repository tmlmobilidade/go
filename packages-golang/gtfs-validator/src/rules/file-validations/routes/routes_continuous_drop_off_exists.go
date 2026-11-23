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
  - Field: continuous_drop_off
  - Presence: Optional
  - Type: Enum

# Description

Requires the continuous_drop_off column and a nonblank value on each row at error severity.
A missing table is handled by the file presence rule. Forbidden severity rejects supplied values.

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
*/
func (RoutesChecks) RoutesContinuousDropOffExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckValues(ctx, db, config, "routes", "continuous_drop_off", "The continuous_drop_off field must be empty.", func(string) bool { return false })
	}

	// 2. Check column and value presence
	return fields.CheckPresence(ctx, db, config, "routes", "continuous_drop_off", false)
}

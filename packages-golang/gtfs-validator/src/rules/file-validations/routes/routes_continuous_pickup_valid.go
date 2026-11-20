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
  - Field: continuous_pickup
  - Presence: Optional
  - Type: Enum

# Description

Accepted values include 0, 1, 2, 3.
Configured options may narrow that list. all_options bypasses the configured list.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
*/
func (RoutesChecks) RoutesContinuousPickupValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check the enum and configured options
	return fields.CheckEnum(ctx, db, config, "routes", "continuous_pickup", "0", "1", "2", "3")
}

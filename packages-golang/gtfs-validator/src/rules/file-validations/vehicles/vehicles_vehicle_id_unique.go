package vehicles

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: vehicle_id
  - Presence: Required
  - Type: Unique ID

# Description

Reports each duplicate nonblank vehicle_id value with all its source rows.
Values are compared exactly. Missing tables, missing columns, and blank values
are handled by the presence rules.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func (VehiclesChecks) VehiclesVehicleIDUnique(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check for duplicate values
	return fields.CheckUnique(ctx, db, config, "vehicles", "vehicle_id")
}

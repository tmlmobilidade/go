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
  - Field: emission
  - Presence: Required
  - Type: Enum

# Description

Requires the emission column and a nonblank value on each row.
A missing table is handled by the file presence rule. Forbidden severity rejects supplied values.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func (VehiclesChecks) VehiclesVehicleEmissionExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckValues(ctx, db, config, "vehicles", "emission", "The emission field must be empty.", func(string) bool { return false })
	}

	// 2. Check column and value presence
	return fields.CheckPresence(ctx, db, config, "vehicles", "emission", true)
}

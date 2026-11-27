package vehicles

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: seating_capacity
  - Presence: Required
  - Type: Non-negative integer

# Description

Checks that each supplied seating_capacity is a non-negative base-ten integer.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func (VehiclesChecks) VehiclesVehicleSeatingCapacityValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "vehicles", "seating_capacity")
	}

	// 2. Check the format of supplied values
	return fields.CheckValues(ctx, db, config, "vehicles", "seating_capacity", "The seating_capacity field must be a non-negative base-ten integer.", validators.ValidateInteger)
}

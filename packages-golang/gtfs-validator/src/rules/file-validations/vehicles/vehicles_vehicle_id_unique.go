package vehicles

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: vehicle_id
  - Presence: Required
  - Type: Unique ID

# Description

Unimplemented. Check for duplicate vehicle IDs. This placeholder always passes.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func (VehiclesChecks) VehiclesVehicleIDUnique(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Pass until this validation is implemented
	return true, nil, nil
}

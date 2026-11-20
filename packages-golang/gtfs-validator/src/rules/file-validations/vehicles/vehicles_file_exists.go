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
  - Presence: Required in GTFS v30
  - Type: File

# Description

Checks that the imported vehicles table exists. Forbidden severity requires its absence.
At ignore severity, an absent table blocks dependent rules without a finding.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func (VehiclesChecks) VehiclesFileExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check whether the imported table meets the configured presence requirement
	return fields.CheckFilePresence(ctx, db, config, "vehicles")
}

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
  - Field: registration_date
  - Presence: Required
  - Type: Date

# Description

Checks that each supplied registration_date is a real calendar date in YYYYMMDD format.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func (VehiclesChecks) VehiclesVehicleRegistrationDateValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "vehicles", "registration_date")
	}

	// 2. Check the format of supplied values
	return fields.CheckValues(ctx, db, config, "vehicles", "registration_date", "The registration_date field must be a real calendar date in YYYYMMDD format.", validators.ValidateDate)
}

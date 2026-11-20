package routes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: agency_id
  - Presence: Conditionally required
  - Type: Foreign ID referencing agency.agency_id

# Description

Requires an agency ID on each row when agency.txt defines multiple agencies
or when this rule has error severity. Forbidden severity rejects supplied values.
The file presence rules handle missing tables.

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
*/
func (RoutesChecks) RoutesAgencyIDExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckValues(ctx, db, config, "routes", "agency_id", "The agency_id field must be empty.", func(string) bool { return false })
	}

	// 2. Require an agency ID at error severity
	if config.Severity == types.SEVERITY_ERROR {
		return fields.CheckPresence(ctx, db, config, "routes", "agency_id", true)
	}

	// 3. Check whether the feed defines multiple agencies
	exists, err := sqlutils.TableExists(ctx, db, "agency")
	if err != nil || !exists {
		return err == nil, nil, err
	}
	count, err := sqlutils.CountRows(ctx, db, "agency")
	if err != nil || count < 2 {
		return err == nil, nil, err
	}

	// 4. Require an agency ID for each row
	return fields.CheckPresence(ctx, db, config, "routes", "agency_id", true)
}

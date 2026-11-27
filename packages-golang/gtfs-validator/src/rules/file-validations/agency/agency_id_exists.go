package agency

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

const idColumn = "agency_id"

// AgencyIDExists requires an ID for each row of a feed with multiple agencies.
func (AgencyChecks) AgencyIDExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Require an agency ID on every row when configured at error severity
	if config.Severity == types.SEVERITY_ERROR {
		return fields.CheckPresence(ctx, db, config, agencyTable, idColumn, true)
	}

	// 2. Check if the agency table exists
	exists, err := sqlutils.TableExists(ctx, db, agencyTable)
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 3. Count agencies to determine whether IDs are required
	count, err := sqlutils.CountRows(ctx, db, agencyTable)
	if err != nil {
		return false, nil, err
	}

	// 4. Validate agency ID presence
	return fields.CheckPresence(ctx, db, config, agencyTable, idColumn, count > 1)
}

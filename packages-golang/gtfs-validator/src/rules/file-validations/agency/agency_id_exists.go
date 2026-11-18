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
	if config.Severity == types.SEVERITY_ERROR {
		return fields.CheckPresence(ctx, db, config, agencyTable, idColumn, true)
	}
	exists, err := sqlutils.TableExists(ctx, db, agencyTable)
	if err != nil || !exists {
		return err == nil, nil, err
	}
	count, err := sqlutils.CountRows(ctx, db, agencyTable)
	if err != nil {
		return false, nil, err
	}
	return fields.CheckPresence(ctx, db, config, agencyTable, idColumn, count > 1)
}

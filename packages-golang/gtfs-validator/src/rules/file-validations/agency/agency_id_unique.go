package agency

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

// AgencyIDUnique reports repeated IDs with all of their source rows.
func (AgencyChecks) AgencyIDUnique(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check for duplicate values
	return fields.CheckUnique(ctx, db, config, agencyTable, idColumn)
}

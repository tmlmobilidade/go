package agency

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

// AgencyIDValid checks supplied values against the configured options.
func (AgencyChecks) AgencyIDValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	return fields.CheckOptions(ctx, db, config, agencyTable, idColumn)
}

package agency

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

const nameColumn = "agency_name"

// AgencyNameField checks the required name field.
func AgencyNameField(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	return fields.CheckPresence(ctx, db, config, agencyTable, nameColumn, true)
}

package agency

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

const urlColumn = "agency_url"

// AgencyURLExists checks the required url field.
func (AgencyChecks) AgencyURLExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Validate the column and required values
	return fields.CheckPresence(ctx, db, config, agencyTable, urlColumn, true)
}

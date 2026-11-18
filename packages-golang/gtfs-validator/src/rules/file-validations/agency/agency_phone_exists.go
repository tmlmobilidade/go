package agency

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

const phoneColumn = "agency_phone"

// AgencyPhoneExists checks agency_phone when the rule is configured at error severity.
func (AgencyChecks) AgencyPhoneExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Validate the column and required values
	return fields.CheckPresence(ctx, db, config, agencyTable, phoneColumn, false)
}

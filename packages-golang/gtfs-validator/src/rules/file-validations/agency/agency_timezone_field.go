package agency

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

const timezoneColumn = "agency_timezone"

// AgencyTimezoneField checks the required timezone field.
func AgencyTimezoneField(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	return fields.CheckPresence(ctx, db, config, agencyTable, timezoneColumn, true)
}

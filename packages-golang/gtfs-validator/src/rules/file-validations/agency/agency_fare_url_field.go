package agency

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

const fareURLColumn = "agency_fare_url"

// AgencyFareURLField checks agency_fare_url when the rule is configured at error severity.
func (AgencyChecks) AgencyFareURLField(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	return fields.CheckPresence(ctx, db, config, agencyTable, fareURLColumn, false)
}

package agency

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

// AgencyFareURLValid checks the syntax of supplied fare URLs.
func AgencyFareURLValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	return fields.CheckValues(ctx, db, config, agencyTable, fareURLColumn, "The agency_fare_url field contains an invalid HTTP or HTTPS URL.", validators.ValidateURL)
}

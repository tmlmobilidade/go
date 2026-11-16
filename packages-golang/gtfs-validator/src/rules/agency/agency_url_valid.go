package agency

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

// AgencyURLValid checks the syntax of supplied agency URLs.
func AgencyURLValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	return fields.CheckValues(ctx, db, config, agencyTable, urlColumn, "The agency_url field contains an invalid HTTP or HTTPS URL.", validators.ValidateURL)
}

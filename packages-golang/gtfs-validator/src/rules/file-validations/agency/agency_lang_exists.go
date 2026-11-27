package agency

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

const langColumn = "agency_lang"

// AgencyLangExists checks agency_lang when the rule is configured at error severity.
func (AgencyChecks) AgencyLangExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Validate the column and required values
	return fields.CheckPresence(ctx, db, config, agencyTable, langColumn, false)
}

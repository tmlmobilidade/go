package agency

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

const langColumn = "agency_lang"

// AgencyLangField checks agency_lang when the rule is configured at error severity.
func (AgencyChecks) AgencyLangField(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	return fields.CheckPresence(ctx, db, config, agencyTable, langColumn, false)
}

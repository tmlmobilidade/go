package agency

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

// AgencyLangValid checks supplied language codes against BCP 47.
func (AgencyChecks) AgencyLangValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	return fields.CheckValues(ctx, db, config, agencyTable, langColumn, "The agency_lang field contains an invalid BCP 47 language tag.", validators.ValidateLanguage)
}

package agency

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

const (
	agencyTable = "agency"
	agencyFile  = agencyTable + ".txt"
)

// AgencyFileExists gates the agency checks on the imported agency.txt table.
func (AgencyChecks) AgencyFileExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check the configured file-presence requirement
	return fields.CheckFilePresence(ctx, db, config, agencyTable)
}

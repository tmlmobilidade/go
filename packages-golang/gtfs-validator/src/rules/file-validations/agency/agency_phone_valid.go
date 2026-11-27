package agency

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

// AgencyPhoneValid checks the dialable format of supplied phone numbers.
func (AgencyChecks) AgencyPhoneValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Validate the format of supplied phone numbers
	return fields.CheckValues(ctx, db, config, agencyTable, phoneColumn, "The agency_phone field contains an invalid phone number.", validators.ValidatePhone)
}

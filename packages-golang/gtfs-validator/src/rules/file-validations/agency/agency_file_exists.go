package agency

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

const (
	agencyTable = "agency"
	agencyFile  = agencyTable + ".txt"
)

// AgencyFileExists gates the agency checks on the imported agency.txt table.
func (AgencyChecks) AgencyFileExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	exists, err := sqlutils.TableExists(ctx, db, agencyTable)
	if err != nil {
		return false, nil, err
	}

	message := "The required agency.txt file is missing."
	if config.Severity == types.SEVERITY_FORBIDDEN {
		if !exists {
			return true, nil, nil
		}
		message = "The forbidden agency.txt file is present."
	} else if exists {
		return true, nil, nil
	}
	if config.Severity == types.SEVERITY_IGNORE {
		return false, nil, nil
	}
	return false, []types.Finding{{
		Description: message,
		Severity:    config.Severity,
		Message:     message,
		FileName:    agencyFile,
	}}, nil
}

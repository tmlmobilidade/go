package trips

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

const (
	tripsTable = "trips"
	tripsFile  = tripsTable + ".txt"
)

// TripsFileExists gates the trips checks on the imported trips.txt table.
func (TripsChecks) TripsFileExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	exists, err := sqlutils.TableExists(ctx, db, tripsTable)
	if err != nil {
		return false, nil, err
	}

	message := "The required trips.txt file is missing."
	if config.Severity == types.SEVERITY_FORBIDDEN {
		if !exists {
			return true, nil, nil
		}
		message = "The forbidden trips.txt file is present."
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
		FileName:    tripsFile,
	}}, nil
}

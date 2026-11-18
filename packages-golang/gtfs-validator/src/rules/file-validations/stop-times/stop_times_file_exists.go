package stoptimes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

const (
	stopTimesTable = "stop_times"
	stopTimesFile  = stopTimesTable + ".txt"
)

// StopTimesFileExists gates the stop_times checks on the imported stop_times.txt table.
func (StopTimesChecks) StopTimesFileExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	exists, err := sqlutils.TableExists(ctx, db, stopTimesTable)
	if err != nil {
		return false, nil, err
	}

	message := "The required stop_times.txt file is missing."
	if config.Severity == types.SEVERITY_FORBIDDEN {
		if !exists {
			return true, nil, nil
		}
		message = "The forbidden stop_times.txt file is present."
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
		FileName:    stopTimesFile,
	}}, nil
}

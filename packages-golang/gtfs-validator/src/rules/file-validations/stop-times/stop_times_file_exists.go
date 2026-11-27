package stoptimes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

const (
	stopTimesTable = "stop_times"
	stopTimesFile  = stopTimesTable + ".txt"
)

// StopTimesFileExists gates the stop_times checks on the imported stop_times.txt table.
func (StopTimesChecks) StopTimesFileExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check the configured file-presence requirement
	return fields.CheckFilePresence(ctx, db, config, stopTimesTable)
}

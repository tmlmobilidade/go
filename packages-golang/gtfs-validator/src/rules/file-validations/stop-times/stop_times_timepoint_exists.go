package stoptimes

import (
	"context"
	"database/sql"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

func (StopTimesChecks) StopTimesTimepointExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	return fields.CheckPresence(ctx, db, config, "stop_times", "timepoint", false)
}

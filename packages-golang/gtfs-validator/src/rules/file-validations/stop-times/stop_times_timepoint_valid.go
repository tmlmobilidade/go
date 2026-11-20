package stoptimes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: timepoint
  - Presence: Optional
  - Type: Enum

# Description

Accepted values include 0, 1.
Configured options may narrow that list. all_options bypasses the configured list.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
*/
func (StopTimesChecks) StopTimesTimepointValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check the enum and configured options
	return fields.CheckEnum(ctx, db, config, "stop_times", "timepoint", "0", "1")
}

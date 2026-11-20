package pattern

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: shape_dist_traveled
  - Presence: Optional
  - Type: Non-negative float

# Description

Checks that trips sharing a route and direction have identical shape_dist_traveled
values in stop sequence order. See PatternSameShapeDistTraveled for the prerequisite checks.

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
*/
func (checks PatternChecks) PatternSameStopDistTraveled(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Run the existing pattern distance check
	return checks.PatternSameShapeDistTraveled(ctx, db, config)
}

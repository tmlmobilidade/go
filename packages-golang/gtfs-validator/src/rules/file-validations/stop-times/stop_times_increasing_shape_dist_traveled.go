package stoptimes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: shape_dist_traveled
  - Presence: See field rules
  - Type: Non-negative float

# Description

Unimplemented. Check that cumulative distance increases along the trip. This placeholder always passes.

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
*/
func (StopTimesChecks) StopTimesIncreasingShapeDistTraveled(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Pass until this validation is implemented
	return true, nil, nil
}

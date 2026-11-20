package stoptimes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: location_group_id
  - Presence: Optional
  - Type: Foreign ID

# Description

Unimplemented. Check when location groups are disallowed. This placeholder always passes.

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
*/
func (StopTimesChecks) StopTimesLocationGroupIDForbidden(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Pass until this validation is implemented
	return true, nil, nil
}

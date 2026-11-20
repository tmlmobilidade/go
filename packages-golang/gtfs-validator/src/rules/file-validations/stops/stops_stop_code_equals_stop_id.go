package stops

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_code, stop_id
  - Presence: Required in GTFS v30
  - Type: Text and ID

# Description

Unimplemented. Compare each stop code with its stop ID. This placeholder always passes.

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func (StopsChecks) StopsStopCodeEqualsStopID(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Pass until this validation is implemented
	return true, nil, nil
}

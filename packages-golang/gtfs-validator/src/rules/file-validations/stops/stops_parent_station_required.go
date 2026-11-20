package stops

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: parent_station
  - Presence: Conditionally required
  - Type: Foreign ID

# Description

Unimplemented. Check for a parent station on location types 2, 3, and 4. This placeholder always passes.

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func (StopsChecks) StopsParentStationRequired(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Pass until this validation is implemented
	return true, nil, nil
}

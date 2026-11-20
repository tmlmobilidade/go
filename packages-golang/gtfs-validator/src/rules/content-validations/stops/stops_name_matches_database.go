package stops

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_name
  - Presence: Required in GTFS v30
  - Type: Text

# Description

Unimplemented. Compare the supplied stop name with the configured database record. This placeholder always passes.

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func (StopContentChecks) StopsNameMatchesDatabase(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Pass until this validation is implemented
	return true, nil, nil
}

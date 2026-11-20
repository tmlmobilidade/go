package stops

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_code
  - Presence: Required in GTFS v30
  - Type: Text

# Description

Reports each duplicate nonblank stop_code value with all its source rows.
Values are compared exactly. Missing tables, missing columns, and blank values
are handled by the presence rules.

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func (StopsChecks) StopsStopCodeUnique(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check for duplicate values
	return fields.CheckUnique(ctx, db, config, "stops", "stop_code")
}

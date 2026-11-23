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
  - Presence: Required in GTFS v30
  - Type: File

# Description

Checks that the imported stops table exists. Forbidden severity requires its absence.
At ignore severity, an absent table blocks dependent rules without a finding.

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func (StopsChecks) StopsFileExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check whether the imported table meets the configured presence requirement
	return fields.CheckFilePresence(ctx, db, config, "stops")
}

package trips

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

const (
	tripsTable = "trips"
	tripsFile  = tripsTable + ".txt"
)

/*
# Attributes

  - File: [trips.txt]
  - Presence: Required
  - Primary key: trip_id
  - Type: File

# Description

Trips for each route. A trip is a sequence of two or more stops that occur during a specific time period.

Validation: Checks that the imported trips table exists. At forbidden severity,
requires its absence. An ignored rule returns a failed result without findings
when the table is missing.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func (TripsChecks) TripsFileExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check the configured file-presence requirement
	return fields.CheckFilePresence(ctx, db, config, tripsTable)
}

package trips

import (
	"context"
	"database/sql"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: trip_id
  - Presence: Required
  - Type: Unique ID

# Description

Ensures the trip_id is at most 36 bytes long (the legacy Go string-length limit).
Blank values are handled by trip_id_exists.

[trips.txt]: https://gtfs.org/schedule/reference/#trips
*/
func (TripsChecks) TripIDMaxLength(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	return fields.CheckValues(ctx, db, config, tripsTable, "trip_id", "The trip_id must be at most 36 bytes long.", func(value string) bool { return len(value) <= 36 })
}

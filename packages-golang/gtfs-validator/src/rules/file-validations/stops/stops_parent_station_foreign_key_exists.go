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
  - Field: parent_station
  - Presence: Conditionally required
  - Type: Foreign ID referencing stops.stop_id

# Description

Checks each supplied parent_station against stops.stop_id.
Missing or blank source values are handled by the presence rule.

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func (StopsChecks) StopsParentStationForeignKeyExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check each supplied ID against the referenced column
	return fields.CheckForeignKey(ctx, db, config, "stops", "parent_station", "stops", "stop_id")
}

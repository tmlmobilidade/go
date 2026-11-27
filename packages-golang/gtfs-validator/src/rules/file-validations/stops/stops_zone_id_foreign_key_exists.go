package stops

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: zone_id
  - Presence: Optional
  - Type: ID

# Description

Checks each supplied zone_id against zones.zone_id.
Missing or blank source values are handled by the presence rule.
The zones table is a feed extension. Standard feeds define zones in stops.txt
and skip this lookup unless they supply zones.txt.

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func (StopsChecks) StopsZoneIDForeignKeyExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check whether the feed declares a zones table
	exists, err := sqlutils.TableExists(ctx, db, "zones")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Check each supplied ID against the referenced column
	return fields.CheckForeignKey(ctx, db, config, "stops", "zone_id", "zones", "zone_id")
}

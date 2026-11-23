package farerules

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [fare_rules.txt]
  - Field: origin_id
  - Presence: Optional
  - Type: Foreign ID referencing stops.zone_id

# Description

Checks each supplied origin_id against stops.zone_id.
Missing or blank source values are handled by the presence rule.

[fare_rules.txt]: https://gtfs.org/documentation/schedule/reference/#fare_rulestxt
*/
func (FareRulesChecks) FareRulesOriginIDForeignKeyExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check each supplied ID against the referenced column
	return fields.CheckForeignKey(ctx, db, config, "fare_rules", "origin_id", "stops", "zone_id")
}

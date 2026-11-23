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
  - Presence: Optional
  - Type: File

# Description

Checks that the imported fare_rules table exists. Forbidden severity requires its absence.
At ignore severity, an absent table blocks dependent rules without a finding.

[fare_rules.txt]: https://gtfs.org/documentation/schedule/reference/#fare_rulestxt
*/
func (FareRulesChecks) FareRulesFileExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check whether the imported table meets the configured presence requirement
	return fields.CheckFilePresence(ctx, db, config, "fare_rules")
}

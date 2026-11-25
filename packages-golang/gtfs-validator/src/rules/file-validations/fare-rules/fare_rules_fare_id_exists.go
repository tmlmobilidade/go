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
  - Field: fare_id
  - Presence: Required
  - Type: Foreign ID referencing fare_attributes.fare_id

# Description

Requires the fare_id column and a nonblank value on each row.
A missing table is handled by the file presence rule. Forbidden severity rejects supplied values.

[fare_rules.txt]: https://gtfs.org/documentation/schedule/reference/#fare_rulestxt
*/
func (FareRulesChecks) FareRulesFareIDExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "fare_rules", "fare_id")
	}

	// 2. Check column and value presence
	return fields.CheckPresence(ctx, db, config, "fare_rules", "fare_id", true)
}

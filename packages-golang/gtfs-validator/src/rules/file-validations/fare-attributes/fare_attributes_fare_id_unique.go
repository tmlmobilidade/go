package fareattributes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: fare_id
  - Presence: Required
  - Type: Unique ID

# Description

Reports each duplicate nonblank fare_id value with all its source rows.
Values are compared exactly. Missing tables, missing columns, and blank values
are handled by the presence rules.

[fare_attributes.txt]: https://gtfs.org/documentation/schedule/reference/#fare_attributestxt
*/
func (FareAttributesChecks) FareAttributesFareIDUnique(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check for duplicate values
	return fields.CheckUnique(ctx, db, config, "fare_attributes", "fare_id")
}

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
  - Presence: Optional
  - Type: File

# Description

Checks that the imported fare_attributes table exists. Forbidden severity requires its absence.
At ignore severity, an absent table blocks dependent rules without a finding.

[fare_attributes.txt]: https://gtfs.org/documentation/schedule/reference/#fare_attributestxt
*/
func (FareAttributesChecks) FareAttributesFileExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check whether the imported table meets the configured presence requirement
	return fields.CheckFilePresence(ctx, db, config, "fare_attributes")
}

package fareattributes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: fare_id
  - Presence: Required
  - Type: Unique ID

# Description

Unimplemented. Check for duplicate fare IDs. This placeholder always passes.

[fare_attributes.txt]: https://gtfs.org/documentation/schedule/reference/#fare_attributestxt
*/
func (FareAttributesChecks) FareAttributesFareIDUnique(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Pass until this validation is implemented
	return true, nil, nil
}

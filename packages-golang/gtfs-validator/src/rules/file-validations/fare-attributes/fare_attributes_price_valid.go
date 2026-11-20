package fareattributes

import (
	"context"
	"database/sql"
	"math"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: price
  - Presence: Required
  - Type: Non-negative float

# Description

Checks that each supplied price is a finite non-negative fare price.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[fare_attributes.txt]: https://gtfs.org/documentation/schedule/reference/#fare_attributestxt
*/
func (FareAttributesChecks) FareAttributesPriceValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckValues(ctx, db, config, "fare_attributes", "price", "The price field must be empty.", func(string) bool { return false })
	}

	// 2. Check the format of supplied values
	return fields.CheckValues(ctx, db, config, "fare_attributes", "price", "The price field must be a finite non-negative fare price.", func(value string) bool {
		return validators.ValidateDecimal(value, 0, math.MaxFloat64)
	})
}

package fareattributes

import (
	"context"
	"database/sql"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	"golang.org/x/text/currency"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: currency_type
  - Presence: Required
  - Type: Currency code

# Description

Checks that each supplied currency_type is an ISO 4217 currency code.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[fare_attributes.txt]: https://gtfs.org/documentation/schedule/reference/#fare_attributestxt
*/
func (FareAttributesChecks) FareAttributesCurrencyTypeValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "fare_attributes", "currency_type")
	}

	// 2. Check the format of supplied values
	return fields.CheckValues(ctx, db, config, "fare_attributes", "currency_type", "The currency_type field must be an ISO 4217 currency code.", func(value string) bool {
		_, err := currency.ParseISO(strings.TrimSpace(value))
		return err == nil
	})
}

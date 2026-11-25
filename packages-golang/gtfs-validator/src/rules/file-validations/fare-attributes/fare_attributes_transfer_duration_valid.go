package fareattributes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: transfer_duration
  - Presence: Optional
  - Type: Non-negative integer

# Description

Checks that each supplied transfer_duration is a non-negative base-ten integer.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[fare_attributes.txt]: https://gtfs.org/documentation/schedule/reference/#fare_attributestxt
*/
func (FareAttributesChecks) FareAttributesTransferDurationValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "fare_attributes", "transfer_duration")
	}

	// 2. Check the format of supplied values
	return fields.CheckValues(ctx, db, config, "fare_attributes", "transfer_duration", "The transfer_duration field must be a non-negative base-ten integer.", validators.ValidateInteger)
}

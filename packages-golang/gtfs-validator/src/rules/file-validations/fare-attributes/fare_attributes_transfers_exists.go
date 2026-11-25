package fareattributes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: transfers
  - Presence: Required
  - Type: Enum

# Description

Requires the transfers column in fare_attributes.txt. Blank values represent
unlimited transfers. Forbidden severity rejects supplied values.

[fare_attributes.txt]: https://gtfs.org/documentation/schedule/reference/#fare_attributestxt
*/
func (FareAttributesChecks) FareAttributesTransfersExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "fare_attributes", "transfers")
	}

	// 2. Check whether the fare attributes table is present
	exists, err := sqlutils.TableExists(ctx, db, "fare_attributes")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 3. Require the column, allowing blank values
	exists, err = sqlutils.ColumnExists(ctx, db, "fare_attributes", "transfers")
	if err != nil || exists {
		return exists, nil, err
	}

	// 4. Return the missing column finding
	const message = "The required transfers column is missing."
	return false, []types.Finding{{
		Description:            message,
		DescriptionTranslation: types.NewTranslation("missing_column", map[string]any{"field": "transfers"}),
		Message:                message,
		MessageTranslation:     types.NewTranslation("missing_column", map[string]any{"field": "transfers"}),
		Severity:               config.Severity,
		FileName:               "fare_attributes.txt",
		Field:                  "transfers",
	}}, nil
}

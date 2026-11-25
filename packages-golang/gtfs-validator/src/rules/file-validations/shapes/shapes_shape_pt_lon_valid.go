package shapes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: shape_pt_lon
  - Presence: Required
  - Type: Longitude

# Description

Checks that each supplied shape_pt_lon is a longitude between -180 and 180 degrees.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
*/
func (ShapesChecks) ShapesShapePtLonValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "shapes", "shape_pt_lon")
	}

	// 2. Check the format of supplied values
	return fields.CheckValues(ctx, db, config, "shapes", "shape_pt_lon", "The shape_pt_lon field must be a longitude between -180 and 180 degrees.", func(value string) bool {
		return validators.ValidateDecimal(value, -180, 180)
	})
}

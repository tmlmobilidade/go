package shapes

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

  - File: [shapes.txt]
  - Field: shape_dist_traveled
  - Presence: Required in GTFS v30
  - Type: Non-negative float

# Description

Checks that each supplied shape_dist_traveled is a finite non-negative decimal.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
*/
func (ShapesChecks) ShapesShapeDistTraveledValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "shapes", "shape_dist_traveled")
	}

	// 2. Check the format of supplied values
	return fields.CheckValues(ctx, db, config, "shapes", "shape_dist_traveled", "The shape_dist_traveled field must be a finite non-negative decimal.", func(value string) bool {
		return validators.ValidateDecimal(value, 0, math.MaxFloat64)
	})
}

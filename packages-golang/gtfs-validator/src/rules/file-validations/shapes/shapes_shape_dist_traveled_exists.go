package shapes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: shape_dist_traveled
  - Presence: Required in GTFS v30
  - Type: Non-negative float

# Description

Requires the shape_dist_traveled column and a nonblank value on each row.
A missing table is handled by the file presence rule. Forbidden severity rejects supplied values.

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
*/
func (ShapesChecks) ShapesShapeDistTraveledExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "shapes", "shape_dist_traveled")
	}

	// 2. Check column and value presence
	return fields.CheckPresence(ctx, db, config, "shapes", "shape_dist_traveled", true)
}

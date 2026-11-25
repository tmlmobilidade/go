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
  - Field: shape_id
  - Presence: Required
  - Type: ID

# Description

Requires the shape_id column and a nonblank value on each row.
A missing table is handled by the file presence rule. Forbidden severity rejects supplied values.

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
*/
func (ShapesChecks) ShapesShapeIDExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "shapes", "shape_id")
	}

	// 2. Check column and value presence
	return fields.CheckPresence(ctx, db, config, "shapes", "shape_id", true)
}

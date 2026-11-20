package shapes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: shape_pt_sequence
  - Presence: Required
  - Type: Non-negative integer

# Description

Unimplemented. Check that point sequence increases strictly within each shape. This placeholder always passes.

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
*/
func (ShapesChecks) ShapesShapePtSequenceStrictlyIncreasing(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Pass until this validation is implemented
	return true, nil, nil
}

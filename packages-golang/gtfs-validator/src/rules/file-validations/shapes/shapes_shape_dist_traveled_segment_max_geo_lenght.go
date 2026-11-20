package shapes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: shape_dist_traveled
  - Presence: Required in GTFS v30
  - Type: Non-negative float

# Description

Unimplemented. Check the maximum distance between consecutive shape points. This placeholder always passes.

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
*/
func (ShapesChecks) ShapesShapeDistTraveledSegmentMaxGeoLenght(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Pass until this validation is implemented
	return true, nil, nil
}

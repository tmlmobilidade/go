package shapes

import (
	"cmp"
	"context"
	"database/sql"
	"fmt"
	"maps"
	"math"
	"slices"
	"strconv"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/geo"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: shape_pt_lat, shape_pt_lon
  - Presence: Required
  - Type: Latitude and longitude

# Description

Measures the great-circle distance between consecutive points within each
shape in numeric shape_pt_sequence order. The default maximum is 1000 meters.
Options can supply one finite, non-negative maximum in meters. A distance
equal to the maximum passes.

The check skips shapes with fewer than two points, invalid coordinates, or
missing, invalid, or repeated sequences. Each finding includes both endpoint rows.

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
*/
func (ShapesChecks) ShapesShapeDistTraveledSegmentMaxGeoLength(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Read the maximum segment length in meters
	limitMeters := 1000.0
	if len(config.Options) > 1 {
		return false, nil, fmt.Errorf("shapes_shape_dist_traveled_segment_max_geo_length accepts at most one distance in meters in options")
	}
	if len(config.Options) == 1 {
		var err error
		limitMeters, err = strconv.ParseFloat(strings.TrimSpace(config.Options[0]), 64)
		if err != nil || math.IsNaN(limitMeters) || math.IsInf(limitMeters, 0) || limitMeters < 0 {
			return false, nil, fmt.Errorf("maximum segment length must be finite and non-negative, got %q", config.Options[0])
		}
	}

	// 2. Check if the shapes table exists
	exists, err := sqlutils.TableExists(ctx, db, "shapes")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 3. Group valid points by shape ID
	type shapePoint struct {
		sequence int64
		position geo.Point
		row      int
	}
	pointsByShape := make(map[string][]shapePoint)
	invalidShapes := make(map[string]bool)
	columns := []string{"shape_id", "shape_pt_sequence", "shape_pt_lat", "shape_pt_lon"}
	err = sqlutils.ForEachRow(ctx, db, "shapes", columns, func(row int, values map[string]string) error {
		id := values["shape_id"]
		if strings.TrimSpace(id) == "" || invalidShapes[id] {
			return nil
		}
		sequence, err := strconv.ParseInt(strings.TrimSpace(values["shape_pt_sequence"]), 10, 64)
		position, valid := geo.ParsePoint(values["shape_pt_lat"], values["shape_pt_lon"])
		if err != nil || sequence < 0 || !valid {
			invalidShapes[id] = true
			delete(pointsByShape, id)
			return nil
		}
		pointsByShape[id] = append(pointsByShape[id], shapePoint{sequence: sequence, position: position, row: row})
		return nil
	})
	if err != nil {
		return false, nil, err
	}

	// 4. Report consecutive segments longer than the limit
	var findings []types.Finding
shapeLoop:
	for _, id := range slices.Sorted(maps.Keys(pointsByShape)) {
		if err := ctx.Err(); err != nil {
			return false, nil, err
		}
		points := pointsByShape[id]
		slices.SortFunc(points, func(a, b shapePoint) int {
			return cmp.Compare(a.sequence, b.sequence)
		})
		for i := 1; i < len(points); i++ {
			if points[i-1].sequence == points[i].sequence {
				continue shapeLoop
			}
		}
		for i := 1; i < len(points); i++ {
			previous, current := points[i-1], points[i]
			distance := geo.DistanceMeters(previous.position, current.position)
			if distance > limitMeters {
				findings = append(findings, types.Finding{
					Description: "The distance between consecutive shape points exceeds the configured maximum.",
					Message:     fmt.Sprintf("Shape %q has a %.2f m segment from sequence %d to %d. The maximum is %g m.", id, distance, previous.sequence, current.sequence, limitMeters),
					Severity:    config.Severity,
					FileName:    "shapes.txt",
					Field:       "shape_pt_lat, shape_pt_lon",
					Rows:        []int{previous.row, current.row},
				})
			}
		}
	}

	// 5. Return the findings
	return len(findings) == 0, findings, nil
}

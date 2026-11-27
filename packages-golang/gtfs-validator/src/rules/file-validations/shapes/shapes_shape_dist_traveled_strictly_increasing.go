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
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: shape_dist_traveled
  - Presence: Required in GTFS v30
  - Type: Non-negative float

# Description

Within each shape, the distance at each point must be greater than the
distance at the preceding point in numeric shape_pt_sequence order. The check
skips points with missing shape IDs or invalid sequences, skips comparisons
that involve missing or invalid distances, and skips shapes with repeated
sequences because their point order is ambiguous.

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
*/
func (ShapesChecks) ShapesShapeDistTraveledStrictlyIncreasing(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the shapes table exists
	exists, err := sqlutils.TableExists(ctx, db, "shapes")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Group points by shape ID and read their numeric sequences and distances
	type shapePoint struct {
		row           int
		sequence      int64
		distance      float64
		validDistance bool
	}
	pointsByShape := make(map[string][]shapePoint)
	err = sqlutils.ForEachRow(ctx, db, "shapes", []string{"shape_id", "shape_pt_sequence", "shape_dist_traveled"}, func(row int, values map[string]string) error {
		id := values["shape_id"]
		sequence, err := strconv.ParseInt(strings.TrimSpace(values["shape_pt_sequence"]), 10, 64)
		if strings.TrimSpace(id) == "" || err != nil || sequence < 0 {
			return nil
		}

		distanceText := strings.TrimSpace(values["shape_dist_traveled"])
		point := shapePoint{row: row, sequence: sequence}
		if validators.ValidateDecimal(distanceText, 0, math.MaxFloat64) {
			point.distance, _ = strconv.ParseFloat(distanceText, 64)
			point.validDistance = true
		}
		pointsByShape[id] = append(pointsByShape[id], point)
		return nil
	})
	if err != nil {
		return false, nil, err
	}

	// 3. Order each shape's points and compare distances between consecutive points
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
			if !previous.validDistance || !current.validDistance || current.distance > previous.distance {
				continue
			}
			findings = append(findings, types.Finding{
				Description:            "The shape_dist_traveled must increase strictly within each shape.",
				DescriptionTranslation: types.NewTranslation("default", nil),
				Message:                fmt.Sprintf("Shape %q has distance %g at sequence %d after distance %g at sequence %d.", id, current.distance, current.sequence, previous.distance, previous.sequence),
				MessageTranslation:     types.NewTranslation("default", map[string]any{"shape_id": id, "current_distance": fmt.Sprintf("%g", current.distance), "current_sequence": current.sequence, "previous_distance": fmt.Sprintf("%g", previous.distance), "previous_sequence": previous.sequence}),
				Severity:               config.Severity,
				FileName:               "shapes.txt",
				Field:                  "shape_dist_traveled",
				Rows:                   []int{previous.row, current.row},
			})
		}
	}

	// 4. Return the findings
	return len(findings) == 0, findings, nil
}

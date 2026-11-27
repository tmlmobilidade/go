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
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: shape_dist_traveled
  - Presence: Required in GTFS v30
  - Type: Non-negative float

# Description

Compares each shape's maximum valid shape_dist_traveled value, measured in
kilometres in GO exports, with the sum of great-circle distances between
consecutive points in numeric shape_pt_sequence order. A difference of up to
10 metres in either direction is allowed.

The check skips shapes with fewer than two points, invalid coordinates,
missing or invalid sequences, repeated sequences, or no valid declared
distance. Each finding points to the rows that declare the maximum distance.

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
*/
func (ShapesChecks) ShapesShapeDistTraveledEqualsGeoLength(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the shapes table exists
	exists, err := sqlutils.TableExists(ctx, db, "shapes")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Read each shape's points and find its maximum declared distance
	type shapePoint struct {
		sequence int64
		position geo.Point
	}
	type shape struct {
		points        []shapePoint
		maxDistanceKM float64
		maxRows       []int
		invalid       bool
	}
	shapes := make(map[string]*shape)
	columns := []string{"shape_id", "shape_pt_sequence", "shape_pt_lat", "shape_pt_lon", "shape_dist_traveled"}
	err = sqlutils.ForEachRow(ctx, db, "shapes", columns, func(row int, values map[string]string) error {
		id := values["shape_id"]
		if strings.TrimSpace(id) == "" {
			return nil
		}
		group := shapes[id]
		if group == nil {
			group = &shape{}
			shapes[id] = group
		}
		if group.invalid {
			return nil
		}

		sequence, err := strconv.ParseInt(strings.TrimSpace(values["shape_pt_sequence"]), 10, 64)
		position, valid := geo.ParsePoint(values["shape_pt_lat"], values["shape_pt_lon"])
		if err != nil || sequence < 0 || !valid {
			group.invalid = true
			group.points = nil
			return nil
		}
		group.points = append(group.points, shapePoint{sequence: sequence, position: position})

		value := strings.TrimSpace(values["shape_dist_traveled"])
		if validators.ValidateDecimal(value, 0, math.MaxFloat64) {
			distance, _ := strconv.ParseFloat(value, 64)
			if distance > group.maxDistanceKM {
				group.maxDistanceKM = distance
				group.maxRows = group.maxRows[:0]
			}
			if distance == group.maxDistanceKM {
				group.maxRows = append(group.maxRows, row)
			}
		}
		return nil
	})
	if err != nil {
		return false, nil, err
	}

	// 3. Measure each shape in sequence order and compare its declared length
	const toleranceMeters = 10.0
	var findings []types.Finding
shapeLoop:
	for _, id := range slices.Sorted(maps.Keys(shapes)) {
		if err := ctx.Err(); err != nil {
			return false, nil, err
		}
		group := shapes[id]
		points := group.points
		if len(points) < 2 || len(group.maxRows) == 0 {
			continue
		}
		slices.SortFunc(points, func(a, b shapePoint) int {
			return cmp.Compare(a.sequence, b.sequence)
		})

		var lengthMeters float64
		for i := 1; i < len(points); i++ {
			previous, current := points[i-1], points[i]
			if current.sequence == previous.sequence {
				continue shapeLoop
			}
			lengthMeters += geo.DistanceMeters(previous.position, current.position)
		}
		declaredMeters := group.maxDistanceKM * 1000
		difference := math.Abs(declaredMeters - lengthMeters)
		if difference > toleranceMeters {
			findings = append(findings, types.Finding{
				Description:            "The maximum shape_dist_traveled must be within 10 m of the geographic shape length.",
				DescriptionTranslation: types.NewTranslation("default", nil),
				Message:                fmt.Sprintf("Shape %q declares %.2f m, measures %.2f m, and differs by %.2f m.", id, declaredMeters, lengthMeters, difference),
				MessageTranslation:     types.NewTranslation("default", map[string]any{"shape_id": id, "declared": fmt.Sprintf("%.2f", declaredMeters), "measured": fmt.Sprintf("%.2f", lengthMeters), "difference": fmt.Sprintf("%.2f", difference)}),
				Severity:               config.Severity,
				FileName:               "shapes.txt",
				Field:                  "shape_dist_traveled",
				Rows:                   group.maxRows,
			})
		}
	}

	// 4. Return the findings
	return len(findings) == 0, findings, nil
}

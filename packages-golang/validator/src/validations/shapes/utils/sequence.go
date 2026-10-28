package utils

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"sort"
	"strconv"
)

// SequencePoint is a projection of the SQLite columns used by these checks.
// Row identifies the original CSV row; Distance is nil when absent or invalid.
type SequencePoint struct {
	ShapeID  string
	Sequence int
	Distance *float64
	Row      int
}

// SequenceGroups reads the current shape's sequence and distance columns from
// SQLite. It never consumes parsed types.Shape records or unrelated coordinates.
func SequenceGroups(db *services.SQLiteContext) ([][]SequencePoint, error) {
	//

	//
	// 1. Get the shape_id value

	shapeID, err := db.Shapes.Field("shape_id")
	if err != nil {
		return nil, err
	}

	//
	// 2. Get the shapes table

	table, err := db.Table("shapes")
	if err != nil {
		return nil, err
	}

	//
	// 3. Get the points

	points := []SequencePoint{}
	err = table.ForEachMatching("shape_id", shapeID, func(row *services.SQLiteRow) error {

		//
		// 3.1 Get the shape_pt_sequence and shape_dist_traveled values

		values, err := row.Fields("shape_pt_sequence", "shape_dist_traveled")
		if err != nil {
			return err
		}

		//
		// 3.2 Parse the shape_pt_sequence value

		sequence, err := strconv.Atoi(values["shape_pt_sequence"])
		if err != nil {
			return err
		}

		//
		// 3.4 Create the sequence point

		point := SequencePoint{ShapeID: shapeID, Sequence: sequence, Row: row.Row}
		if distance, err := strconv.ParseFloat(values["shape_dist_traveled"], 64); err == nil {
			point.Distance = &distance
		}

		points = append(points, point)
		return nil
	})
	if err != nil {
		return nil, err
	}

	//
	// 4. Sort the points by sequence

	sort.SliceStable(points, func(i, j int) bool { return points[i].Sequence < points[j].Sequence })

	//
	// 5. Return the points

	return [][]SequencePoint{points}, nil
}

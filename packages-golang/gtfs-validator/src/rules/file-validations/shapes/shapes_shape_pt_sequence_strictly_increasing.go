package shapes

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: shape_pt_sequence
  - Presence: Required
  - Type: Non-negative integer

# Description

Point sequence values must be distinct within each shape. Numeric sequence
defines point order, so CSV row order and gaps in the sequence are allowed.
Missing shape IDs and missing or invalid sequences are handled by the field checks.

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
*/
func (ShapesChecks) ShapesShapePtSequenceStrictlyIncreasing(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the shapes table exists
	exists, err := sqlutils.TableExists(ctx, db, "shapes")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Group source rows by shape ID and numeric sequence
	type shapeSequence struct {
		id       string
		sequence int64
	}
	rowsByPoint := make(map[shapeSequence][]int)
	var points []shapeSequence
	err = sqlutils.ForEachRow(ctx, db, "shapes", []string{"shape_id", "shape_pt_sequence"}, func(row int, values map[string]string) error {
		id := values["shape_id"]
		sequence, err := strconv.ParseInt(strings.TrimSpace(values["shape_pt_sequence"]), 10, 64)
		if strings.TrimSpace(id) == "" || err != nil || sequence < 0 {
			return nil
		}
		point := shapeSequence{id: id, sequence: sequence}
		if len(rowsByPoint[point]) == 0 {
			points = append(points, point)
		}
		rowsByPoint[point] = append(rowsByPoint[point], row)
		return nil
	})
	if err != nil {
		return false, nil, err
	}

	// 3. Report duplicate sequences with all corresponding source rows
	var findings []types.Finding
	for _, point := range points {
		rows := rowsByPoint[point]
		if len(rows) > 1 {
			findings = append(findings, types.Finding{
				Description: "The shape_pt_sequence must increase strictly within each shape.",
				Message:     fmt.Sprintf("Shape %q uses shape_pt_sequence %d more than once.", point.id, point.sequence),
				Severity:    config.Severity,
				FileName:    "shapes.txt",
				Field:       "shape_pt_sequence",
				Rows:        rows,
			})
		}
	}

	// 4. Return the findings
	return len(findings) == 0, findings, nil
}

package trips

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

  - File: [trips.txt]
  - Field: shape_id
  - Presence: Conditionally Required
  - Type: Foreign Key referencing shapes.shape_id

# Description

The shape_id must end in _0 when direction_id is 0, or _1 when direction_id is 1.
Missing shape IDs and missing or invalid direction IDs are handled by their field checks.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func (TripsChecks) TripShapeIDUsesDirectionID(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the trips table exists
	exists, err := sqlutils.TableExists(ctx, db, tripsTable)
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. For each row in the trips table, check if the shape_id ends in _0 or _1
	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, tripsTable, []string{"shape_id", "direction_id"}, func(row int, values map[string]string) error {
		shape := values["shape_id"]
		direction, err := strconv.Atoi(strings.TrimSpace(values["direction_id"]))
		if strings.TrimSpace(shape) == "" || err != nil || direction < 0 || direction > 1 {
			return nil
		}
		suffix := "_" + strconv.Itoa(direction)
		if !strings.HasSuffix(shape, suffix) {
			findings = append(findings, types.Finding{
				Description:            "The shape_id suffix must match direction_id.",
				DescriptionTranslation: types.NewTranslation("default", nil),
				Message:                fmt.Sprintf("Shape ID %q must end in %q for direction_id %d.", shape, suffix, direction),
				MessageTranslation:     types.NewTranslation("default", map[string]any{"shape_id": shape, "suffix": suffix, "direction_id": direction}),
				Severity:               config.Severity,
				FileName:               tripsFile,
				Field:                  "shape_id",
				Rows:                   []int{row},
			})
		}
		return nil
	})

	// 3. Return the findings
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}

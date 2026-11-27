package trips

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: shape_id
  - Presence: Conditionally Required
  - Type: Foreign Key referencing shapes.shape_id

# Description

Identifies a geospatial shape describing the vehicle travel path for a trip.

Conditionally Required:
  - Required if the trip has a continuous pickup or drop-off behavior defined either in routes.txt or in stop_times.txt.
  - Optional otherwise.

Validation: Each supplied shape_id must exist in shapes.shape_id.
Missing values are handled by trip_shape_id_exists.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func (TripsChecks) TripShapeIDForeignKeyExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Report each shape_id missing from shapes.txt
	var findings []types.Finding
	err := fields.ForEachMissingForeignKey(ctx, db, "trips", "shape_id", "shapes", "shape_id", func(row int, value string) {
		findings = append(findings, types.Finding{
			Description:            "The shape_id references a missing shape_id.",
			DescriptionTranslation: types.NewTranslation("missing_reference_value", map[string]any{"field": "shape_id", "target_field": "shape_id"}),
			Message:                fmt.Sprintf("Unknown shape_id %q.", value),
			MessageTranslation:     types.NewTranslation("missing_reference_value", map[string]any{"target_field": "shape_id", "value": value}),
			Severity:               config.Severity,
			FileName:               "trips.txt",
			Field:                  "shape_id",
			Rows:                   []int{row},
		})
	})

	// 2. Return the findings
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}

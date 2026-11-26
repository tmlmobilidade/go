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
  - Field: route_id
  - Presence: Required
  - Type: Foreign Key referencing routes.route_id

# Description

Identifies a route.

Validation: Each supplied route_id must exist in routes.route_id.
Missing values are handled by trip_route_id_exists.

[trips.txt]: https://gtfs.org/schedule/reference/#trips
*/
func (TripsChecks) TripRouteIDForeignKeyExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Report each route_id missing from routes.txt
	var findings []types.Finding
	err := fields.ForEachMissingForeignKey(ctx, db, "trips", "route_id", "routes", "route_id", func(row int, value string) {
		findings = append(findings, types.Finding{
			Description:            "The route_id references a missing route_id.",
			DescriptionTranslation: types.NewTranslation("missing_reference_value", map[string]any{"field": "route_id", "target_field": "route_id"}),
			Message:                fmt.Sprintf("Unknown route_id %q.", value),
			MessageTranslation:     types.NewTranslation("missing_reference_value", map[string]any{"target_field": "route_id", "value": value}),
			Severity:               config.Severity,
			FileName:               "trips.txt",
			Field:                  "route_id",
			Rows:                   []int{row},
		})
	})

	// 2. Return the findings
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}

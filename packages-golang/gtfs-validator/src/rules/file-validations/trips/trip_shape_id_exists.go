package trips

import (
	"context"
	"database/sql"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
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

Validation: Requires a nonblank shape_id when the trip or its route specifies continuous
pickup or drop-off (0, 2, or 3). At error severity, requires shape_id on every trip.
At forbidden severity, rejects supplied shape_id values.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func (TripsChecks) TripShapeIDExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Apply the configured requirement to every trip
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, tripsTable, "shape_id")
	}
	if config.Severity == types.SEVERITY_ERROR {
		return fields.CheckPresence(ctx, db, config, tripsTable, "shape_id", false)
	}

	// 2. Check if the trips table exists
	exists, err := sqlutils.TableExists(ctx, db, tripsTable)
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 3. Collect routes and trips with continuous pickup or drop-off
	required := make(map[string]map[string]bool)
	for _, source := range []struct{ table, key string }{{"routes", "route_id"}, {"stop_times", "trip_id"}} {
		required[source.table] = make(map[string]bool)
		exists, err := sqlutils.TableExists(ctx, db, source.table)
		if err != nil {
			return false, nil, err
		}
		if !exists {
			continue
		}
		err = sqlutils.ForEachRow(ctx, db, source.table, []string{source.key, "continuous_pickup", "continuous_drop_off"}, func(_ int, values map[string]string) error {
			for _, field := range []string{"continuous_pickup", "continuous_drop_off"} {
				// 1 means no continuous service. Empty fields do not establish a requirement.
				value := strings.TrimSpace(values[field])
				if value == "0" || value == "2" || value == "3" {
					key := values[source.key]
					if strings.TrimSpace(key) != "" {
						required[source.table][key] = true
					}
				}
			}
			return nil
		})
		if err != nil {
			return false, nil, err
		}
	}

	// 4. Find trips that require a shape but do not supply one
	finding := types.Finding{
		Description:            "A shape_id is required for trips with continuous pickup or drop-off.",
		DescriptionTranslation: types.NewTranslation("default", nil),
		Message:                "The shape_id is missing for a trip with continuous service.",
		MessageTranslation:     types.NewTranslation("default", nil),
		Severity:               config.Severity,
		FileName:               tripsFile,
		Field:                  "shape_id",
	}
	err = sqlutils.ForEachRow(ctx, db, tripsTable, []string{"trip_id", "route_id", "shape_id"}, func(row int, values map[string]string) error {
		if strings.TrimSpace(values["shape_id"]) == "" && (required["routes"][values["route_id"]] || required["stop_times"][values["trip_id"]]) {
			finding.Rows = append(finding.Rows, row)
		}
		return nil
	})

	// 5. Return the findings
	if err != nil {
		return false, nil, err
	}
	if len(finding.Rows) > 0 {
		return false, []types.Finding{finding}, nil
	}

	return true, nil, nil
}

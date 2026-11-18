package trips

import (
	"context"
	"database/sql"
	"fmt"
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

Identifies a geospatial shape describing the vehicle travel path for a trip.

Conditionally Required:
  - Required if the trip has a continuous pickup or drop-off behavior defined either in routes.txt or in stop_times.txt.
  - Optional otherwise.

Validation: Each route may have at most two distinct nonblank shape_id values.
Findings include the source rows containing those values.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func (TripsChecks) TripShapeIDMaxTwoPerRoute(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	const column = "shape_id"
	exists, err := sqlutils.TableExists(ctx, db, tripsTable)
	if err != nil || !exists {
		return err == nil, nil, err
	}
	type group struct {
		values map[string]bool
		rows   []int
	}
	groups := make(map[string]*group)
	var order []string
	err = sqlutils.ForEachRow(ctx, db, tripsTable, []string{"route_id", column}, func(row int, values map[string]string) error {
		route, value := values["route_id"], values[column]
		if strings.TrimSpace(route) == "" || strings.TrimSpace(value) == "" {
			return nil
		}
		if groups[route] == nil {
			groups[route] = &group{values: make(map[string]bool)}
			order = append(order, route)
		}
		groups[route].values[value] = true
		groups[route].rows = append(groups[route].rows, row)
		return nil
	})
	if err != nil {
		return false, nil, err
	}
	var findings []types.Finding
	for _, route := range order {
		g := groups[route]
		if len(g.values) > 2 {
			findings = append(findings, types.Finding{Description: "A route must have at most two distinct " + column + " values.", Message: fmt.Sprintf("Route %q has %d distinct %s values.", route, len(g.values), column), Severity: config.Severity, FileName: tripsFile, Field: column, Rows: g.rows})
		}
	}
	return len(findings) == 0, findings, nil
}

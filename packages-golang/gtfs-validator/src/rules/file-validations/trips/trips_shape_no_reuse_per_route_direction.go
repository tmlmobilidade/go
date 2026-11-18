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

Identifies a geospatial shape describing the vehicle travel path for a trip.

Conditionally Required:
  - Required if the trip has a continuous pickup or drop-off behavior defined either in routes.txt or in stop_times.txt.
  - Optional otherwise.

Validation: A shape_id may belong to only one route_id and direction_id pair.
Repeated trips within that pair are allowed. Rows without a shape, route, or valid
direction (0 or 1) are skipped; their field checks handle those values.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func (TripsChecks) TripsShapeNoReusePerRouteDirection(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	exists, err := sqlutils.TableExists(ctx, db, tripsTable)
	if err != nil || !exists {
		return err == nil, nil, err
	}
	type pair struct {
		route     string
		direction int
	}
	type group struct {
		pairs map[pair]bool
		rows  []int
	}
	groups := make(map[string]*group)
	var order []string
	err = sqlutils.ForEachRow(ctx, db, tripsTable, []string{"shape_id", "route_id", "direction_id"}, func(row int, values map[string]string) error {
		shape, route := values["shape_id"], values["route_id"]
		direction, err := strconv.Atoi(strings.TrimSpace(values["direction_id"]))
		if strings.TrimSpace(shape) == "" || strings.TrimSpace(route) == "" || err != nil || direction < 0 || direction > 1 {
			return nil
		}
		if groups[shape] == nil {
			groups[shape] = &group{pairs: make(map[pair]bool)}
			order = append(order, shape)
		}
		groups[shape].pairs[pair{route, direction}] = true
		groups[shape].rows = append(groups[shape].rows, row)
		return nil
	})
	if err != nil {
		return false, nil, err
	}
	var findings []types.Finding
	for _, shape := range order {
		g := groups[shape]
		if len(g.pairs) > 1 {
			findings = append(findings, types.Finding{Description: "A shape must not be reused across route and direction pairs.", Message: fmt.Sprintf("Shape %q is used by %d route and direction pairs.", shape, len(g.pairs)), Severity: config.Severity, FileName: tripsFile, Field: "shape_id", Rows: g.rows})
		}
	}
	return len(findings) == 0, findings, nil
}

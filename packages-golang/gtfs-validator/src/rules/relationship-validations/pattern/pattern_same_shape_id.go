package pattern

import (
	"context"
	"database/sql"
	"fmt"
	"maps"
	"slices"
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

Trips with the same route_id and direction_id must share a single shape_id.
The check groups by the supplied route_id and direction_id values. It skips an
absent trips table and rows with a missing or blank route_id, direction_id, or
shape_id. Each finding includes all compared rows in the conflicting group.

[trips.txt]: https://gtfs.org/documentation/schedule/reference/#tripstxt
*/
func (PatternChecks) PatternSameShapeID(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the trips table exists
	exists, err := sqlutils.TableExists(ctx, db, "trips")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Group shape IDs and source rows by route and direction
	type pair struct {
		route     string
		direction string
	}
	type group struct {
		shapes map[string]bool
		rows   []int
	}
	groups := make(map[pair]*group)
	var order []pair
	err = sqlutils.ForEachRow(ctx, db, "trips", []string{"route_id", "direction_id", "shape_id"}, func(row int, values map[string]string) error {
		route, direction, shape := values["route_id"], values["direction_id"], values["shape_id"]
		if strings.TrimSpace(route) == "" || strings.TrimSpace(direction) == "" || strings.TrimSpace(shape) == "" {
			return nil
		}
		key := pair{route, direction}
		if groups[key] == nil {
			groups[key] = &group{shapes: make(map[string]bool)}
			order = append(order, key)
		}
		groups[key].shapes[shape] = true
		groups[key].rows = append(groups[key].rows, row)
		return nil
	})
	if err != nil {
		return false, nil, err
	}

	// 3. Report groups with more than one distinct shape ID
	var findings []types.Finding
	for _, key := range order {
		group := groups[key]
		if len(group.shapes) > 1 {
			shapes := fmt.Sprintf("%q", slices.Sorted(maps.Keys(group.shapes)))
			findings = append(findings, types.Finding{
				Description:            "Trips with the same route_id and direction_id must share a shape_id.",
				DescriptionTranslation: types.NewTranslation("default", nil),
				Message:                fmt.Sprintf("Route %q with direction_id %q has conflicting shape IDs %s.", key.route, key.direction, shapes),
				MessageTranslation:     types.NewTranslation("default", map[string]any{"route_id": key.route, "direction_id": key.direction, "values": shapes}),
				Severity:               config.Severity,
				FileName:               "trips.txt",
				Field:                  "shape_id",
				Rows:                   group.rows,
			})
		}
	}

	// 4. Return the findings
	return len(findings) == 0, findings, nil
}

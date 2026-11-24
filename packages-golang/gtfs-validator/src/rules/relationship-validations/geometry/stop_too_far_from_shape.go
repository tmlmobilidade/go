package geometry

import (
	"cmp"
	"context"
	"database/sql"
	"fmt"
	"math"
	"slices"
	"strconv"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/geo"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_id (stop_lat and stop_lon define the location)
  - Presence: Required for stop_id and Conditionally Required for the coordinates
  - Type: Unique ID, Latitude, and Longitude, respectively

# Description

Within each route_id and direction_id group, each stop must be within the
configured distance of every shape used by a trip that serves it. Options must
contain exactly one finite, non-negative distance in meters, such as ["20"].
Distance is measured on a sphere to the nearest segment of each shape,
connecting its points in numeric shape_pt_sequence order.
Repeated trips serving the same stop on the same shape within a group produce
one finding on the stops.txt row.

The check skips missing inputs, unresolved or ambiguous references, invalid stop
coordinates, trips without a valid route and direction key, and shapes with
fewer than two points, invalid coordinates, or invalid or duplicate sequences.

[stops.txt]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func (GeometryChecks) StopTooFarFromShape(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Read the configured distance in meters
	options := config.Options()
	if len(options) != 1 {
		return false, nil, fmt.Errorf("stop_too_far_from_shape requires exactly one distance in meters in options")
	}
	limitMeters, err := strconv.ParseFloat(strings.TrimSpace(options[0]), 64)
	if err != nil || math.IsNaN(limitMeters) || math.IsInf(limitMeters, 0) || limitMeters < 0 {
		return false, nil, fmt.Errorf("stop_too_far_from_shape distance must be finite and non-negative, got %q", options[0])
	}

	// 2. Check if the tables needed to link stops to shapes exist
	for _, table := range []string{"trips", "stop_times", "stops", "shapes"} {
		exists, err := sqlutils.TableExists(ctx, db, table)
		if err != nil || !exists {
			return err == nil, nil, err
		}
	}

	// 3. Index trips by their route, direction, and shape
	type tripShape struct {
		route     string
		direction int
		shape     string
	}
	trips := make(map[string]tripShape)
	usedShapes := make(map[string]bool)
	err = sqlutils.ForEachRow(ctx, db, "trips", []string{"trip_id", "route_id", "direction_id", "shape_id"}, func(_ int, values map[string]string) error {
		id, route, shape := values["trip_id"], values["route_id"], values["shape_id"]
		direction, err := strconv.Atoi(strings.TrimSpace(values["direction_id"]))
		if strings.TrimSpace(id) == "" || strings.TrimSpace(route) == "" || strings.TrimSpace(shape) == "" || err != nil || direction < 0 || direction > 1 {
			return nil
		}
		key := tripShape{route, direction, shape}
		if previous, exists := trips[id]; exists && previous != key {
			trips[id] = tripShape{} // Conflicting references cannot resolve to a single shape.
			return nil
		}
		trips[id] = key
		usedShapes[shape] = true
		return nil
	})
	if err != nil || len(trips) == 0 {
		return err == nil, nil, err
	}

	// 4. Load shape points and order them by sequence
	type shapePoint struct {
		position geo.Point
		sequence int64
	}
	shapePoints := make(map[string][]shapePoint)
	err = sqlutils.ForEachRow(ctx, db, "shapes", []string{"shape_id", "shape_pt_lat", "shape_pt_lon", "shape_pt_sequence"}, func(_ int, values map[string]string) error {
		id := values["shape_id"]
		if !usedShapes[id] {
			return nil
		}
		point, valid := geo.ParsePoint(values["shape_pt_lat"], values["shape_pt_lon"])
		sequence, err := strconv.ParseInt(strings.TrimSpace(values["shape_pt_sequence"]), 10, 64)
		if !valid || err != nil || sequence < 0 {
			delete(usedShapes, id)
			delete(shapePoints, id)
			return nil
		}
		shapePoints[id] = append(shapePoints[id], shapePoint{point, sequence})
		return nil
	})
	if err != nil {
		return false, nil, err
	}
	shapes := make(map[string][]geo.Point)
	for id, points := range shapePoints {
		if err := ctx.Err(); err != nil {
			return false, nil, err
		}
		if len(points) < 2 {
			continue
		}
		slices.SortFunc(points, func(a, b shapePoint) int { return cmp.Compare(a.sequence, b.sequence) })
		line := make([]geo.Point, 0, len(points))
		for i, point := range points {
			if i > 0 && points[i-1].sequence == point.sequence {
				break
			}
			line = append(line, point.position)
		}
		if len(line) == len(points) {
			shapes[id] = line
		}
	}
	if len(shapes) == 0 {
		return true, nil, nil
	}

	// 5. Index valid stop coordinates and their source rows
	type stopLocation struct {
		position geo.Point
		row      int
	}
	stops := make(map[string]stopLocation)
	err = sqlutils.ForEachRow(ctx, db, "stops", []string{"stop_id", "stop_lat", "stop_lon"}, func(row int, values map[string]string) error {
		id := values["stop_id"]
		if point, valid := geo.ParsePoint(values["stop_lat"], values["stop_lon"]); strings.TrimSpace(id) != "" && valid {
			if _, exists := stops[id]; exists {
				stops[id] = stopLocation{row: -1} // More than one source row makes the reference ambiguous.
			} else {
				stops[id] = stopLocation{point, row}
			}
		}
		return nil
	})
	if err != nil || len(stops) == 0 {
		return err == nil, nil, err
	}

	// 6. Check each distinct stop and serving shape within its route and direction group
	type stopShape struct {
		tripShape
		stop string
	}
	checked := make(map[stopShape]bool)
	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, "stop_times", []string{"trip_id", "stop_id"}, func(_ int, values map[string]string) error {
		trip := trips[values["trip_id"]]
		stopID := values["stop_id"]
		stop, exists := stops[stopID]
		points := shapes[trip.shape]
		key := stopShape{trip, stopID}
		if !exists || stop.row < 0 || len(points) == 0 || checked[key] {
			return nil
		}
		checked[key] = true

		nearest, outside := geo.OutsidePolylineBufferMeters(stop.position, points, limitMeters)
		if !outside {
			return nil
		}
		findings = append(findings, types.Finding{
			Description: fmt.Sprintf("Stops must be within %g meters of the shapes of the trips that serve them.", limitMeters),
			Message:     fmt.Sprintf("Stop %q is %.3f m from shape %q on route %q with direction_id %d.", stopID, nearest, trip.shape, trip.route, trip.direction),
			Severity:    config.Severity,
			FileName:    "stops.txt",
			Field:       "stop_id",
			Rows:        []int{stop.row},
		})
		return nil
	})

	// 7. Return the findings
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}

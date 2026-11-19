package pattern

import (
	"context"
	"database/sql"
	"fmt"
	"maps"
	"math"
	"slices"
	"strconv"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: shape_dist_traveled
  - Presence: Optional
  - Type: Non-negative Float

# Description

Trips with the same route_id and direction_id must have equal numeric distances
at matching stop_id and stop_sequence values. Each finding includes the compared
source rows at one stop occurrence shared by at least two trips.

The check skips missing tables, trips without a route or direction, and stop
times without a matching trip, stop ID, integer sequence, or finite distance.
Trip IDs assigned to conflicting route and direction groups are ambiguous and
are skipped.

[stop_times.txt]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func (PatternChecks) PatternSameShapeDistTraveled(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the trips table and stop time distances are available
	exists, err := sqlutils.TableExists(ctx, db, "trips")
	if err != nil || !exists {
		return err == nil, nil, err
	}
	exists, err = sqlutils.ColumnExists(ctx, db, "stop_times", "shape_dist_traveled")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Index each trip by its route and direction
	type pattern struct {
		route     string
		direction string
	}
	patterns := make(map[string]pattern)
	err = sqlutils.ForEachRow(ctx, db, "trips", []string{"trip_id", "route_id", "direction_id"}, func(_ int, values map[string]string) error {
		trip, route, direction := values["trip_id"], values["route_id"], values["direction_id"]
		if strings.TrimSpace(trip) == "" || strings.TrimSpace(route) == "" || strings.TrimSpace(direction) == "" {
			return nil
		}
		key := pattern{route, direction}
		if previous, found := patterns[trip]; found && previous != key {
			patterns[trip] = pattern{}
		} else {
			patterns[trip] = key
		}
		return nil
	})
	if err != nil {
		return false, nil, err
	}
	if len(patterns) == 0 {
		return true, nil, nil
	}

	// 3. Group distances and source rows by pattern and stop occurrence
	type stopOccurrence struct {
		pattern
		stop     string
		sequence int64
	}
	type group struct {
		distances     map[float64]bool
		rows          []int
		firstTrip     string
		multipleTrips bool
	}
	groups := make(map[stopOccurrence]*group)
	var order []stopOccurrence
	err = sqlutils.ForEachRow(ctx, db, "stop_times", []string{"trip_id", "stop_id", "stop_sequence", "shape_dist_traveled"}, func(row int, values map[string]string) error {
		trip, stop := values["trip_id"], values["stop_id"]
		tripPattern := patterns[trip]
		if tripPattern.route == "" || strings.TrimSpace(stop) == "" {
			return nil
		}
		sequence, err := strconv.ParseInt(strings.TrimSpace(values["stop_sequence"]), 10, 64)
		if err != nil {
			return nil
		}
		distance, err := strconv.ParseFloat(strings.TrimSpace(values["shape_dist_traveled"]), 64)
		if err != nil || math.IsNaN(distance) || math.IsInf(distance, 0) {
			return nil
		}

		key := stopOccurrence{tripPattern, stop, sequence}
		g := groups[key]
		if g == nil {
			g = &group{distances: make(map[float64]bool), firstTrip: trip}
			groups[key] = g
			order = append(order, key)
		}
		g.multipleTrips = g.multipleTrips || g.firstTrip != trip
		g.distances[distance] = true
		g.rows = append(g.rows, row)
		return nil
	})
	if err != nil {
		return false, nil, err
	}

	// 4. Report stop occurrences with conflicting distances across trips
	var findings []types.Finding
	for _, key := range order {
		g := groups[key]
		if g.multipleTrips && len(g.distances) > 1 {
			findings = append(findings, types.Finding{
				Description: "Trips with the same route_id and direction_id must share shape_dist_traveled at each matching stop.",
				Message:     fmt.Sprintf("Route %q with direction_id %q has conflicting distances %v at stop %q, stop_sequence %d.", key.route, key.direction, slices.Sorted(maps.Keys(g.distances)), key.stop, key.sequence),
				Severity:    config.Severity,
				FileName:    "stop_times.txt",
				Field:       "shape_dist_traveled",
				Rows:        g.rows,
			})
		}
	}

	// 5. Return the findings
	return len(findings) == 0, findings, nil
}

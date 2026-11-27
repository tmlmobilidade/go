package pattern

import (
	"cmp"
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/binary"
	"fmt"
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

Trips with the same route_id and direction_id must have identical numeric
shape_dist_traveled lists. Each trip's distances are ordered by numeric
stop_sequence, with equal sequence numbers ordered by distance. The rule hashes
the route_id, direction_id, and ordered distances and compares hashes within
each group. Each finding includes the compared stop_times source rows.

The check skips missing tables, trips without a route or direction, and trip IDs
assigned to conflicting groups. It also skips trips without stop times or with
a missing or non-integer stop_sequence or a missing or non-finite distance.

[stop_times.txt]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func (PatternChecks) PatternSameStopDistTraveled(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

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

	// 2. Index trips by ID and record their route and direction
	type pattern struct {
		route     string
		direction string
	}
	type stopTime struct {
		sequence int64
		distance float64
		row      int
	}
	type tripStops struct {
		pattern
		times      []stopTime
		incomplete bool
		hash       [sha256.Size]byte
	}
	trips := make(map[string]*tripStops)
	var tripIDs []string
	err = sqlutils.ForEachRow(ctx, db, "trips", []string{"trip_id", "route_id", "direction_id"}, func(_ int, values map[string]string) error {
		id, route, direction := values["trip_id"], values["route_id"], values["direction_id"]
		if strings.TrimSpace(id) == "" || strings.TrimSpace(route) == "" || strings.TrimSpace(direction) == "" {
			return nil
		}
		key := pattern{route, direction}
		if previous := trips[id]; previous != nil {
			previous.incomplete = previous.incomplete || previous.pattern != key
		} else {
			trips[id] = &tripStops{pattern: key}
			tripIDs = append(tripIDs, id)
		}
		return nil
	})
	if err != nil {
		return false, nil, err
	}
	if len(trips) == 0 {
		return true, nil, nil
	}

	// 3. Read each trip's distances, sequence numbers, and source rows
	err = sqlutils.ForEachRow(ctx, db, "stop_times", []string{"trip_id", "stop_sequence", "shape_dist_traveled"}, func(row int, values map[string]string) error {
		trip := trips[values["trip_id"]]
		if trip == nil || trip.incomplete {
			return nil
		}
		sequence, err := strconv.ParseInt(strings.TrimSpace(values["stop_sequence"]), 10, 64)
		if err != nil {
			trip.incomplete = true
			return nil
		}
		distance, err := strconv.ParseFloat(strings.TrimSpace(values["shape_dist_traveled"]), 64)
		if err != nil || math.IsNaN(distance) || math.IsInf(distance, 0) {
			trip.incomplete = true
			return nil
		}
		trip.times = append(trip.times, stopTime{sequence: sequence, distance: distance, row: row})
		return nil
	})
	if err != nil {
		return false, nil, err
	}

	// 4. Hash each ordered distance list with its route and direction
	groups := make(map[pattern][]string)
	var order []pattern
	var encoded []byte
	for _, id := range tripIDs {
		if err := ctx.Err(); err != nil {
			return false, nil, err
		}
		trip := trips[id]
		if trip.incomplete || len(trip.times) == 0 {
			continue
		}
		slices.SortFunc(trip.times, func(a, b stopTime) int {
			if comparison := cmp.Compare(a.sequence, b.sequence); comparison != 0 {
				return comparison
			}
			return cmp.Compare(a.distance, b.distance)
		})

		// Length prefixes keep the route and direction IDs unambiguous.
		encoded = binary.AppendUvarint(encoded[:0], uint64(len(trip.route)))
		encoded = append(encoded, trip.route...)
		encoded = binary.AppendUvarint(encoded, uint64(len(trip.direction)))
		encoded = append(encoded, trip.direction...)
		for _, time := range trip.times {
			bits := math.Float64bits(time.distance)
			if time.distance == 0 {
				bits = 0 // Positive and negative zero compare equal.
			}
			encoded = binary.LittleEndian.AppendUint64(encoded, bits)
		}
		trip.hash = sha256.Sum256(encoded)
		if len(groups[trip.pattern]) == 0 {
			order = append(order, trip.pattern)
		}
		groups[trip.pattern] = append(groups[trip.pattern], id)
	}

	// 5. Compare trip hashes and report differences within each group
	var findings []types.Finding
	for _, key := range order {
		ids := groups[key]
		reference := trips[ids[0]]
		var difference string
		var translation *types.Translation
		for _, id := range ids[1:] {
			candidate := trips[id]
			if reference.hash == candidate.hash {
				continue
			}
			if len(reference.times) != len(candidate.times) {
				difference = fmt.Sprintf("Trips %q and %q have %d and %d distances, respectively.", ids[0], id, len(reference.times), len(candidate.times))
				translation = types.NewTranslation("different_count", map[string]any{
					"route_id": key.route, "direction_id": key.direction, "reference": ids[0], "candidate": id,
					"first": len(reference.times), "second": len(candidate.times),
				})
				break
			}
			for i, time := range reference.times {
				if other := candidate.times[i]; time.distance != other.distance {
					difference = fmt.Sprintf("Trips %q and %q have shape_dist_traveled values %g and %g at position %d.", ids[0], id, time.distance, other.distance, i+1)
					translation = types.NewTranslation("different_value", map[string]any{
						"route_id": key.route, "direction_id": key.direction, "reference": ids[0], "candidate": id,
						"first": fmt.Sprintf("%g", time.distance), "second": fmt.Sprintf("%g", other.distance), "position": i + 1,
					})
					break
				}
			}
			break
		}
		if difference == "" {
			continue
		}
		var rows []int
		for _, id := range ids {
			for _, time := range trips[id].times {
				rows = append(rows, time.row)
			}
		}
		slices.Sort(rows)
		findings = append(findings, types.Finding{
			Description:            "Trips with the same route_id and direction_id must have the same shape_dist_traveled list.",
			DescriptionTranslation: types.NewTranslation("default", nil),
			Message:                fmt.Sprintf("Route %q with direction_id %q. %s", key.route, key.direction, difference),
			MessageTranslation:     translation,
			Severity:               config.Severity,
			FileName:               "stop_times.txt",
			Field:                  "shape_dist_traveled",
			Rows:                   rows,
		})
	}

	// 6. Return the findings
	return len(findings) == 0, findings, nil
}

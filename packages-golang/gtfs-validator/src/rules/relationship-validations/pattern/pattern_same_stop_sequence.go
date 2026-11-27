package pattern

import (
	"cmp"
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/binary"
	"fmt"
	"slices"
	"strconv"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: stop_sequence
  - Presence: Required
  - Type: Non-negative Integer

# Description

Trips with the same route_id and direction_id must have identical numeric
stop_sequence lists. For each trip, the rule hashes its route_id, direction_id,
and numerically sorted stop_sequence values, preserving duplicates. It compares
the hashes within each group and reports the compared stop_times source rows.

The check skips missing tables, trips without a route or direction, and trip IDs
assigned to conflicting groups. It also skips trips without stop times or with
a missing or non-integer stop_sequence.

[stop_times.txt]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func (PatternChecks) PatternSameStopSequence(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if both source tables exist
	for _, table := range []string{"trips", "stop_times"} {
		exists, err := sqlutils.TableExists(ctx, db, table)
		if err != nil || !exists {
			return err == nil, nil, err
		}
	}

	// 2. Index trips by ID and record their route and direction
	type pattern struct {
		route     string
		direction string
	}
	type stopTime struct {
		sequence int64
		row      int
	}
	type tripStops struct {
		pattern
		times     []stopTime
		ambiguous bool
		hash      [sha256.Size]byte
	}
	trips := make(map[string]*tripStops)
	var tripIDs []string
	err := sqlutils.ForEachRow(ctx, db, "trips", []string{"trip_id", "route_id", "direction_id"}, func(_ int, values map[string]string) error {
		id, route, direction := values["trip_id"], values["route_id"], values["direction_id"]
		if strings.TrimSpace(id) == "" || strings.TrimSpace(route) == "" || strings.TrimSpace(direction) == "" {
			return nil
		}
		key := pattern{route, direction}
		if previous := trips[id]; previous != nil {
			previous.ambiguous = previous.ambiguous || previous.pattern != key
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

	// 3. Read each trip's sequence numbers and source rows
	err = sqlutils.ForEachRow(ctx, db, "stop_times", []string{"trip_id", "stop_sequence"}, func(row int, values map[string]string) error {
		trip := trips[values["trip_id"]]
		if trip == nil || trip.ambiguous {
			return nil
		}
		sequence, err := strconv.ParseInt(strings.TrimSpace(values["stop_sequence"]), 10, 64)
		if err != nil {
			trip.ambiguous = true
			return nil
		}
		trip.times = append(trip.times, stopTime{sequence: sequence, row: row})
		return nil
	})
	if err != nil {
		return false, nil, err
	}

	// 4. Hash each sorted sequence with its route and direction
	groups := make(map[pattern][]string)
	var order []pattern
	var encoded []byte
	for _, id := range tripIDs {
		if err := ctx.Err(); err != nil {
			return false, nil, err
		}
		trip := trips[id]
		if trip.ambiguous || len(trip.times) == 0 {
			continue
		}
		slices.SortFunc(trip.times, func(a, b stopTime) int {
			return cmp.Compare(a.sequence, b.sequence)
		})
		// Length prefixes keep the route and direction IDs unambiguous.
		encoded = binary.AppendUvarint(encoded[:0], uint64(len(trip.route)))
		encoded = append(encoded, trip.route...)
		encoded = binary.AppendUvarint(encoded, uint64(len(trip.direction)))
		encoded = append(encoded, trip.direction...)
		for _, time := range trip.times {
			encoded = binary.AppendVarint(encoded, time.sequence)
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
				difference = fmt.Sprintf("Trips %q and %q have %d and %d stop times, respectively.", ids[0], id, len(reference.times), len(candidate.times))
				translation = types.NewTranslation("different_count", map[string]any{
					"route_id": key.route, "direction_id": key.direction, "reference": ids[0], "candidate": id,
					"first": len(reference.times), "second": len(candidate.times),
				})
				break
			}
			for i, time := range reference.times {
				if other := candidate.times[i]; time.sequence != other.sequence {
					difference = fmt.Sprintf("Trips %q and %q have stop_sequence values %d and %d at sorted position %d.", ids[0], id, time.sequence, other.sequence, i+1)
					translation = types.NewTranslation("different_value", map[string]any{
						"route_id": key.route, "direction_id": key.direction, "reference": ids[0], "candidate": id,
						"first": time.sequence, "second": other.sequence, "position": i + 1,
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
			Description:            "Trips with the same route_id and direction_id must have the same stop sequence.",
			DescriptionTranslation: types.NewTranslation("default", nil),
			Message:                fmt.Sprintf("Route %q with direction_id %q. %s", key.route, key.direction, difference),
			MessageTranslation:     translation,
			Severity:               config.Severity,
			FileName:               "stop_times.txt",
			Field:                  "stop_sequence",
			Rows:                   rows,
		})
	}

	// 6. Return the findings
	return len(findings) == 0, findings, nil
}

package pattern

import (
	"cmp"
	"context"
	"database/sql"
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

Trips with the same route_id and direction_id must have identical sequences of
locations and numeric stop_sequence values. Locations are identified by stop_id,
location_group_id, or location_id. Stop times are sorted by stop_sequence before
comparison. Each finding includes the compared source rows for one group.

The check skips missing tables, trips without a route or direction, and trip IDs
assigned to conflicting groups. Trips without stop times or with an ambiguous
sequence are skipped. A sequence is ambiguous when a row has no integer
stop_sequence, duplicates another row's sequence number, or has anything other
than one supplied location.

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
	type stop struct {
		sequence int64
		field    string
		location string
	}
	type stopTime struct {
		stop
		row int
	}
	type tripStops struct {
		pattern
		times     []stopTime
		ambiguous bool
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

	// 3. Read each trip's numbered stop locations
	locationFields := []string{"stop_id", "location_group_id", "location_id"}
	columns := append([]string{"trip_id", "stop_sequence"}, locationFields...)
	err = sqlutils.ForEachRow(ctx, db, "stop_times", columns, func(row int, values map[string]string) error {
		trip := trips[values["trip_id"]]
		if trip == nil || trip.ambiguous {
			return nil
		}
		sequence, err := strconv.ParseInt(strings.TrimSpace(values["stop_sequence"]), 10, 64)
		if err != nil {
			trip.ambiguous = true
			return nil
		}
		time := stopTime{stop: stop{sequence: sequence}, row: row}
		for _, field := range locationFields {
			if strings.TrimSpace(values[field]) == "" {
				continue
			}
			if time.field != "" {
				trip.ambiguous = true
				return nil
			}
			time.field, time.location = field, values[field]
		}
		if time.field == "" {
			trip.ambiguous = true
			return nil
		}
		trip.times = append(trip.times, time)
		return nil
	})
	if err != nil {
		return false, nil, err
	}

	// 4. Order complete trip sequences and group them by route and direction
	groups := make(map[pattern][]string)
	var order []pattern
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
		for i := 1; i < len(trip.times); i++ {
			if trip.times[i-1].sequence == trip.times[i].sequence {
				trip.ambiguous = true
				break
			}
		}
		if trip.ambiguous {
			continue
		}
		if len(groups[trip.pattern]) == 0 {
			order = append(order, trip.pattern)
		}
		groups[trip.pattern] = append(groups[trip.pattern], id)
	}

	// 5. Report the first difference and the compared rows for each conflicting group
	var findings []types.Finding
	for _, key := range order {
		ids := groups[key]
		reference := trips[ids[0]].times
		var difference string
		for _, id := range ids[1:] {
			candidate := trips[id].times
			for i := range min(len(reference), len(candidate)) {
				a, b := reference[i], candidate[i]
				if a.stop != b.stop {
					difference = fmt.Sprintf("Trips %q and %q differ at position %d: %s %q at sequence %d versus %s %q at sequence %d.", ids[0], id, i+1, a.field, a.location, a.sequence, b.field, b.location, b.sequence)
					break
				}
			}
			if difference == "" && len(reference) != len(candidate) {
				difference = fmt.Sprintf("Trips %q and %q have %d and %d stop times, respectively.", ids[0], id, len(reference), len(candidate))
			}
			if difference != "" {
				break
			}
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
			Description: "Trips with the same route_id and direction_id must have the same stop sequence.",
			Message:     fmt.Sprintf("Route %q with direction_id %q. %s", key.route, key.direction, difference),
			Severity:    config.Severity,
			FileName:    "stop_times.txt",
			Field:       "stop_sequence",
			Rows:        rows,
		})
	}

	// 6. Return the findings
	return len(findings) == 0, findings, nil
}

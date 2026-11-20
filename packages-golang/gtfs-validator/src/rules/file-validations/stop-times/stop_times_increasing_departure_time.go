package stoptimes

import (
	"cmp"
	"context"
	"database/sql"
	"fmt"
	"maps"
	"slices"
	"strconv"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: departure_time
  - Presence: Conditionally Required
  - Type: Time

# Description

The departure_time values must be non-decreasing within each trip in numeric
stop_sequence order. Equal times are valid. The check skips rows without a
trip ID or valid sequence, comparisons involving missing or malformed times,
and trips with repeated sequences because their stop order is ambiguous.

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
*/
func (StopTimesChecks) StopTimesIncreasingDepartureTime(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the stop_times table exists
	exists, err := sqlutils.TableExists(ctx, db, "stop_times")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Group stops by trip ID and read their numeric sequences
	type stopTime struct {
		row      int
		sequence int64
		time     string
	}
	stopsByTrip := make(map[string][]stopTime)
	err = sqlutils.ForEachRow(ctx, db, "stop_times", []string{"trip_id", "stop_sequence", "departure_time"}, func(row int, values map[string]string) error {
		id := values["trip_id"]
		sequence, err := strconv.ParseInt(strings.TrimSpace(values["stop_sequence"]), 10, 64)
		if strings.TrimSpace(id) == "" || err != nil || sequence < 0 {
			return nil
		}
		stopsByTrip[id] = append(stopsByTrip[id], stopTime{row: row, sequence: sequence, time: values["departure_time"]})
		return nil
	})
	if err != nil {
		return false, nil, err
	}

	// 3. Order each trip's stops and compare consecutive times
	var findings []types.Finding
tripLoop:
	for _, id := range slices.Sorted(maps.Keys(stopsByTrip)) {
		if err := ctx.Err(); err != nil {
			return false, nil, err
		}
		stops := stopsByTrip[id]
		slices.SortFunc(stops, func(a, b stopTime) int {
			return cmp.Compare(a.sequence, b.sequence)
		})
		for i := 1; i < len(stops); i++ {
			if stops[i-1].sequence == stops[i].sequence {
				continue tripLoop
			}
		}

		for i := 1; i < len(stops); i++ {
			previous, current := stops[i-1], stops[i]
			if order, valid := validators.CompareTimes(current.time, previous.time); valid && order < 0 {
				findings = append(findings, types.Finding{
					Description: "The departure_time must not decrease within a trip.",
					Message:     fmt.Sprintf("Trip %q has departure_time %q at stop_sequence %d after %q at stop_sequence %d.", id, current.time, current.sequence, previous.time, previous.sequence),
					Severity:    config.Severity,
					FileName:    "stop_times.txt",
					Field:       "departure_time",
					Rows:        []int{previous.row, current.row},
				})
			}
		}
	}

	// 4. Return the findings
	return len(findings) == 0, findings, nil
}

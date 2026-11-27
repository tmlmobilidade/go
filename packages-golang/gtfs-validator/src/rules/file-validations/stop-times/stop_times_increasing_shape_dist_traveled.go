package stoptimes

import (
	"cmp"
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
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: shape_dist_traveled
  - Presence: Required in GTFS v30
  - Type: Non-negative float

# Description

Within each trip, the distance at each stop must be greater than the
distance at the preceding stop in numeric stop_sequence order. The check
skips stops with missing trip IDs or invalid sequences, skips comparisons
that involve missing or invalid distances, and skips trips with repeated
sequences because their stop order is ambiguous.

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
*/
func (StopTimesChecks) StopTimesIncreasingShapeDistTraveled(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the stop_times table exists
	exists, err := sqlutils.TableExists(ctx, db, "stop_times")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Group stops by trip ID and read their numeric sequences and distances
	type tripStop struct {
		row           int
		sequence      int64
		distance      float64
		validDistance bool
	}
	stopsByTrip := make(map[string][]tripStop)
	err = sqlutils.ForEachRow(ctx, db, "stop_times", []string{"trip_id", "stop_sequence", "shape_dist_traveled"}, func(row int, values map[string]string) error {
		id := values["trip_id"]
		sequence, err := strconv.ParseInt(strings.TrimSpace(values["stop_sequence"]), 10, 64)
		if strings.TrimSpace(id) == "" || err != nil || sequence < 0 {
			return nil
		}

		distanceText := strings.TrimSpace(values["shape_dist_traveled"])
		stop := tripStop{row: row, sequence: sequence}
		if validators.ValidateDecimal(distanceText, 0, math.MaxFloat64) {
			stop.distance, _ = strconv.ParseFloat(distanceText, 64)
			stop.validDistance = true
		}
		stopsByTrip[id] = append(stopsByTrip[id], stop)
		return nil
	})
	if err != nil {
		return false, nil, err
	}

	// 3. Order each trip's stops and compare distances between consecutive stops
	var findings []types.Finding
tripLoop:
	for _, id := range slices.Sorted(maps.Keys(stopsByTrip)) {
		if err := ctx.Err(); err != nil {
			return false, nil, err
		}
		stops := stopsByTrip[id]
		slices.SortFunc(stops, func(a, b tripStop) int {
			return cmp.Compare(a.sequence, b.sequence)
		})
		for i := 1; i < len(stops); i++ {
			if stops[i-1].sequence == stops[i].sequence {
				continue tripLoop
			}
		}

		for i := 1; i < len(stops); i++ {
			previous, current := stops[i-1], stops[i]
			if !previous.validDistance || !current.validDistance || current.distance > previous.distance {
				continue
			}
			findings = append(findings, types.Finding{
				Description:            "The shape_dist_traveled must increase strictly within each trip.",
				DescriptionTranslation: types.NewTranslation("default", nil),
				Message:                fmt.Sprintf("Trip %q has distance %g at sequence %d after distance %g at sequence %d.", id, current.distance, current.sequence, previous.distance, previous.sequence),
				MessageTranslation:     types.NewTranslation("default", map[string]any{"trip_id": id, "current_distance": fmt.Sprintf("%g", current.distance), "current_sequence": current.sequence, "previous_distance": fmt.Sprintf("%g", previous.distance), "previous_sequence": previous.sequence}),
				Severity:               config.Severity,
				FileName:               "stop_times.txt",
				Field:                  "shape_dist_traveled",
				Rows:                   []int{previous.row, current.row},
			})
		}
	}

	// 4. Return the findings
	return len(findings) == 0, findings, nil
}

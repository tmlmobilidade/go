package trips_utils

import (
	"fmt"
	"main/lib"
	"main/services"
	"sort"
	"strconv"
)

type SequencePoint struct {
	Stop     string
	Sequence int
	Distance float64
}

// StopSequence reads current SQLite values without merging distinct source rows.
// Gaps in stop_sequence are valid; distances may be equal, but must not decrease.
func StopSequence(db *services.SQLiteContext, tripID string) ([]SequencePoint, string, error) {
	table, err := db.Table("stop_times")
	if err != nil {
		return nil, "", err
	}
	points := []SequencePoint{}
	diagnostic := ""
	err = table.ForEachMatching("trip_id", tripID, func(row *services.SQLiteRow) error {
		fields, err := row.Fields("stop_id", "stop_sequence", "shape_dist_traveled")
		if err != nil {
			return err
		}
		sequence, err := strconv.Atoi(fields["stop_sequence"])
		if err != nil {
			diagnostic = "invalid"
			return nil
		}
		distance := -1.0
		if fields["shape_dist_traveled"] != "" {
			distance, err = strconv.ParseFloat(fields["shape_dist_traveled"], 64)
			if err != nil {
				diagnostic = "invalid_shape_dist"
				return nil
			}
		}
		point := SequencePoint{fields["stop_id"], sequence, distance}
		points = append(points, point)
		return nil
	})
	if err != nil {
		return nil, "", err
	}
	sort.SliceStable(points, func(i, j int) bool { return points[i].Sequence < points[j].Sequence })
	return points, diagnostic, nil
}

func SequenceHash(points []SequencePoint) string {
	value := ""
	for _, point := range points {
		value += fmt.Sprintf("%s-%v-%v", point.Stop, point.Distance, point.Sequence)
	}
	return lib.Hash(value)
}

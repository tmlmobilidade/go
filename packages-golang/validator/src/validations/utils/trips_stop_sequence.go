package validationutils

import (
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"sort"
	"strconv"
)

type TripsSequencePoint struct {
	Stop     string
	Sequence int
	Distance float64
}

// StopSequence streams current SQLite values in one query per trip without
// merging distinct source rows.
// Gaps in stop_sequence are valid; distances may be equal, but must not decrease.
func StopSequence(db *services.SQLiteContext, tripID string) ([]TripsSequencePoint, string, error) {
	table, err := db.Table("stop_times")
	if err != nil {
		return nil, "", err
	}
	points := []TripsSequencePoint{}
	diagnostic := ""
	err = table.ForEachMatchingFields("trip_id", tripID, []string{"stop_id", "stop_sequence", "shape_dist_traveled"}, func(_ *services.SQLiteRow, fields map[string]string) error {
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
		point := TripsSequencePoint{fields["stop_id"], sequence, distance}
		points = append(points, point)
		return nil
	})
	if err != nil {
		return nil, "", err
	}
	sort.SliceStable(points, func(i, j int) bool { return points[i].Sequence < points[j].Sequence })
	return points, diagnostic, nil
}

func SequenceHash(points []TripsSequencePoint) string {
	value := ""
	for _, point := range points {
		value += fmt.Sprintf("%s-%v-%v", point.Stop, point.Distance, point.Sequence)
	}
	return lib.Hash(value)
}

package validationutils

import (
	"crypto/sha256"
	"fmt"
	"sort"
	"strconv"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

type TripsSequencePoint struct {
	Stop     string
	Sequence int
	Distance float64
}

// StopSequence reads current imported values. Gaps are valid; distances may be equal.
func StopSequence(ctx *contextTypes.ValidationContext, tripID string) ([]TripsSequencePoint, string, error) {
	table, err := Table(ctx, "stop_times")
	if err != nil {
		return nil, "", err
	}
	points := []TripsSequencePoint{}
	diagnostic := ""
	err = queries.ForEachMatchingFields(table, "trip_id", []any{tripID}, []string{"stop_id", "stop_sequence", "shape_dist_traveled"}, func(_ *sqliteTypes.SQLiteRow, fields map[string]string) error {
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
		points = append(points, TripsSequencePoint{fields["stop_id"], sequence, distance})
		return nil
	})
	sort.SliceStable(points, func(i, j int) bool { return points[i].Sequence < points[j].Sequence })
	return points, diagnostic, err
}

func SequenceDiagnostic(points []TripsSequencePoint, diagnostic string) string {
	if diagnostic != "" {
		return diagnostic
	}
	for index := 1; index < len(points); index++ {
		previous, current := points[index-1], points[index]
		if current.Sequence <= previous.Sequence {
			return "non_increasing_sequence"
		}
		if current.Distance >= 0 && previous.Distance >= 0 && current.Distance < previous.Distance {
			return "non_increasing_shape_dist"
		}
		if current.Stop != "" && current.Stop == previous.Stop {
			return "consecutive_stop_ids"
		}
	}
	return ""
}

func SequenceHash(points []TripsSequencePoint) string {
	var text strings.Builder
	for _, point := range points {
		fmt.Fprintf(&text, "%s-%v-%v", point.Stop, point.Distance, point.Sequence)
	}
	return fmt.Sprintf("%x", sha256.Sum256([]byte(text.String())))
}

// SequenceHashes replaces the external map populated by a previous rule. It reads
// its own prerequisites and retains missing signatures for invalid sequences.
func SequenceHashes(ctx *contextTypes.ValidationContext) (map[int]string, error) {
	hashes := map[int]string{}
	signatures := map[string]string{}
	table := &sqliteTypes.SQLiteTable{DB: ctx.DB, Name: "trips"}
	err := queries.ForEachRowFields(table, []string{"trip_id"}, func(row *sqliteTypes.SQLiteRow) error {
		trip := row.Values["trip_id"]
		if trip == "" {
			return nil
		}
		signature, found := signatures[trip]
		if !found {
			points, diagnostic, err := StopSequence(ctx, trip)
			if err != nil {
				return err
			}
			if SequenceDiagnostic(points, diagnostic) == "" {
				signature = SequenceHash(points)
			}
			signatures[trip] = signature
		}
		hashes[row.Row] = signature
		return nil
	})
	return hashes, err
}

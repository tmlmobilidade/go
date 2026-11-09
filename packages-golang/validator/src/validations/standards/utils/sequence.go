package standardutils

import (
	"sort"
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	geoTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/geo"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

// SequenceGroups reads source rows once and orders each shape by numeric sequence.
// A shape with an unusable sequence is left to its sequence-value check.
func SequenceGroups(ctx *context.ValidationContext) (map[string][]geoTypes.ShapePoint, error) {
	groups := map[string][]geoTypes.ShapePoint{}
	invalid := map[string]bool{}
	table := &sqliteTypes.SQLiteTable{DB: ctx.DB, Name: "shapes"}
	err := queries.ForEachRowFields(table, []string{"shape_id", "shape_pt_sequence", "shape_dist_traveled"}, func(row *sqliteTypes.SQLiteRow) error {
		id := row.Values["shape_id"]
		if id == "" {
			return nil
		}
		sequence, err := strconv.Atoi(row.Values["shape_pt_sequence"])
		if err != nil || sequence < 0 {
			invalid[id] = true
			return nil
		}
		point := geoTypes.ShapePoint{ShapeID: id, Row: row.Row, Sequence: sequence}
		if value, err := strconv.ParseFloat(row.Values["shape_dist_traveled"], 64); err == nil {
			point.Distance = &value
		}
		groups[id] = append(groups[id], point)
		return nil
	})
	if err != nil {
		return nil, err
	}
	for id, points := range groups {
		if invalid[id] {
			delete(groups, id)
			continue
		}
		sort.SliceStable(points, func(i, j int) bool { return points[i].Sequence < points[j].Sequence })
	}
	return groups, nil
}

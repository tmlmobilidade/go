package standardutils

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

// RoutesWithWindows derives this rule's route lookup from its own SQLite input.
func RoutesWithWindows(ctx *contextTypes.ValidationContext) (map[string]bool, error) {
	trips := map[string]bool{}
	stops := &sqliteTypes.SQLiteTable{DB: ctx.DB, Name: "stop_times"}
	err := queries.ForEachRowFields(stops, []string{"trip_id", "start_pickup_drop_off_window", "end_pickup_drop_off_window"}, func(row *sqliteTypes.SQLiteRow) error {
		if row.Values["trip_id"] != "" && (row.Values["start_pickup_drop_off_window"] != "" || row.Values["end_pickup_drop_off_window"] != "") {
			trips[row.Values["trip_id"]] = true
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	ids := make([]string, 0, len(trips))
	for id := range trips {
		ids = append(ids, id)
	}
	routes := map[string]bool{}
	table := &sqliteTypes.SQLiteTable{DB: ctx.DB, Name: "trips"}
	err = queries.ForEachMatchingValuesFields(table, "trip_id", ids, []string{"route_id"}, func(_ *sqliteTypes.SQLiteRow, values map[string]string) error {
		if values["route_id"] != "" {
			routes[values["route_id"]] = true
		}
		return nil
	})
	return routes, err
}

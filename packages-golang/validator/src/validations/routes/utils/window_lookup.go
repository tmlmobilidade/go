package routes_utils

import "github.com/tmlmobilidade/go/packages-golang/validator/src/services"

// RoutesWithWindows builds the lookup once, shared by both continuous-service checks.
func RoutesWithWindows(tables *services.SQLiteTables) (map[string]bool, error) {
	result := make(map[string]bool)
	if !tables.Has("trips") || !tables.Has("stop_times") {
		return result, nil
	}
	tripRoutes := make(map[string]string)
	err := tables.ForEachRow("trips", func(row *services.SQLiteRow) error {
		values, err := row.Fields("trip_id", "route_id")
		if err != nil {
			return err
		}
		if values["trip_id"] != "" && values["route_id"] != "" {
			tripRoutes[values["trip_id"]] = values["route_id"]
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	err = tables.ForEachRow("stop_times", func(row *services.SQLiteRow) error {
		values, err := row.Fields("trip_id", "start_pickup_drop_off_window", "end_pickup_drop_off_window")
		if err != nil {
			return err
		}
		if values["start_pickup_drop_off_window"] != "" || values["end_pickup_drop_off_window"] != "" {
			if route := tripRoutes[values["trip_id"]]; route != "" {
				result[route] = true
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return result, nil
}

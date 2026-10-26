package trips_utils

import "main/services"

// ForGroupFields streams the requested fields and source rows in one group
// query, avoiding a separate field lookup for every member. Values stay live.
func ForGroupFields(db *services.SQLiteContext, field string, fields []string, fn func(*services.SQLiteRow, map[string]string) error) error {
	key, err := db.Trips.Field(field)
	if err != nil {
		return err
	}
	if key == "" {
		return nil
	}
	table, err := db.Table("trips")
	if err != nil {
		return err
	}
	return table.ForEachMatchingFields(field, key, fields, fn)
}

func ForGroup(db *services.SQLiteContext, field string, fn func(*services.SQLiteRow) error) error {
	key, err := db.Trips.Field(field)
	if err != nil {
		return err
	}
	if key == "" {
		return nil
	}
	table, err := db.Table("trips")
	if err != nil {
		return err
	}
	return table.ForEachMatching(field, key, fn)
}

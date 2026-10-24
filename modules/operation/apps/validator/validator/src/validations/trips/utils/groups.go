package trips_utils

import "main/services"

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

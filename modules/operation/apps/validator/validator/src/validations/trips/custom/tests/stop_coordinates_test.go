package trips_custom_test

import (
	"main/services"
	"main/types"
	checks "main/validations/trips/custom/checks"
	trips_utils "main/validations/trips/utils"
	"testing"
)

func TestStopCoordinates(t *testing.T) {
	runCases(t, "trip_path_stop_coordinates_referenced_from_stops", "stop_id", "trips.txt", func(db *services.SQLiteContext, rules *types.RuleContext) error {
		return checks.StopCoordinates(db, rules, &trips_utils.Geometry{})
	}, []scenario{
		{name: "OnShape"}, {name: "OffShape", sql: "UPDATE stops SET stop_lat='40' WHERE stop_id='A'", count: 1}, {name: "RepeatedOffShapeStop", sql: "UPDATE stops SET stop_lat='40' WHERE stop_id='A';INSERT INTO stop_times VALUES ('T1','A','3','2000')", count: 1}, {name: "MissingShape", values: map[string]any{"shape_id": ""}}, {name: "InvalidCoordinates", sql: "UPDATE stops SET stop_lat='invalid'"}, {name: "MissingStop", sql: "DELETE FROM stops"},
	})
}

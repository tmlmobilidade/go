package trips_custom_test

import (
	"main/services"
	"main/types"
	checks "main/validations/trips/custom/checks"
	trips_utils "main/validations/trips/utils"
	"testing"
)

func TestStopCoordinates(t *testing.T) {
	runCases(t, "trips_stop_coordinates", "stop_id", "trips.txt", func(db *services.SQLiteContext, rules *types.RuleContext) error {
		return checks.StopCoordinates(db, rules, &trips_utils.Geometry{})
	}, []scenario{
		{name: "DuplicateStopUsesFirstCompleteRow", sql: "INSERT INTO stops VALUES ('A','40','-9.1')"},
		{name: "DuplicateStopSkipsIncompleteRow", sql: "UPDATE stops SET stop_lat='' WHERE stop_id='A'; INSERT INTO stops VALUES ('A','40','-9.1')", count: 1},
		{name: "DuplicateStopKeepsInvalidFirstRow", sql: "UPDATE stops SET stop_lat='invalid' WHERE stop_id='A'; INSERT INTO stops VALUES ('A','40','-9.1')"},
		{name: "OnShape"}, {name: "OffShape", sql: "UPDATE stops SET stop_lat='40' WHERE stop_id='A'", count: 1}, {name: "RepeatedOffShapeStop", sql: "UPDATE stops SET stop_lat='40' WHERE stop_id='A';INSERT INTO stop_times VALUES ('T1','A','3','2000')", count: 1}, {name: "MissingShape", values: map[string]any{"shape_id": ""}}, {name: "InvalidCoordinates", sql: "UPDATE stops SET stop_lat='invalid'"}, {name: "MissingStop", sql: "DELETE FROM stops"},
	})
}

package trips_custom_test

import (
	"main/services"
	"main/types"
	checks "main/validations/trips/custom/checks"
	"testing"
)

func TestStopSequence(t *testing.T) {
	runCases(t, "trips_stop_sequence", "stop_sequence", "trips.txt", func(db *services.SQLiteContext, rules *types.RuleContext) error {
		return checks.StopSequence(db, rules, map[int]string{})
	}, []scenario{
		{name: "Valid"}, {name: "Gaps", sql: "UPDATE stop_times SET stop_sequence='20' WHERE stop_sequence='2'"}, {name: "DuplicateSequence", sql: "UPDATE stop_times SET stop_sequence='1'", count: 1}, {name: "ExactDuplicate", sql: "INSERT INTO stop_times SELECT * FROM stop_times WHERE rowid=1", count: 1}, {name: "BadSequence", sql: "UPDATE stop_times SET stop_sequence='x' WHERE rowid=1", count: 1}, {name: "BadDistance", sql: "UPDATE stop_times SET shape_dist_traveled='x' WHERE rowid=1", count: 1}, {name: "DecreasingDistance", sql: "UPDATE stop_times SET shape_dist_traveled='2000' WHERE rowid=1", count: 1}, {name: "EqualDistance", sql: "UPDATE stop_times SET shape_dist_traveled='0'"}, {name: "RepeatedStop", sql: "UPDATE stop_times SET stop_id='A'", count: 1}, {name: "MissingDistance", sql: "UPDATE stop_times SET shape_dist_traveled=NULL"},
	})
}

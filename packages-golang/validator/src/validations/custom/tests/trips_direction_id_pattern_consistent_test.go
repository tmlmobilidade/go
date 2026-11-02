package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/custom/checks"
	"testing"
)

func TestDirectionIdPatternConsistent(t *testing.T) {
	runCases(t, "trips_direction_id_pattern_consistent", "direction_id", "trips.txt", custom.DirectionIdPatternConsistent, []scenario{
		{name: "OneTrip"}, {name: "Identical", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; "}, {name: "Mismatch", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET direction_id='1' WHERE rowid=5", count: 1}, {name: "OtherPattern", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET direction_id='1',pattern_id='different' WHERE rowid=5"},
	})
}

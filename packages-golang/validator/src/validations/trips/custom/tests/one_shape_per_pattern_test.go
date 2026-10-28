package trips_custom_test

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/trips/custom/checks"
	"main/types"
	"testing"
)

func TestOneShapePerPattern(t *testing.T) {
	runCases(t, "trips_one_shape_per_pattern", "shape_id", "trips.txt", func(db *services.SQLiteContext, rules *types.RuleContext) error {
		return checks.OneShapePerPattern(db, rules, map[[2]string]bool{})
	}, []scenario{
		{name: "One"}, {name: "Mismatch", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET shape_id='other' WHERE rowid=5", count: 1},
	})
}

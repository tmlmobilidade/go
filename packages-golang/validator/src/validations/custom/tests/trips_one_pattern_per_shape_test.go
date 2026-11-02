package custom_test

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/custom/checks"
	"main/types"
	"testing"
)

func TestOnePatternPerShape(t *testing.T) {
	runCases(t, "trips_one_pattern_per_shape", "shape_id", "trips.txt", func(db *services.SQLiteContext, rules *types.RuleContext) error {
		return custom.OnePatternPerShape(db, rules, map[[2]string]bool{})
	}, []scenario{
		{name: "One"}, {name: "Mismatch", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET pattern_id='other' WHERE rowid=5", count: 1},
	})
}

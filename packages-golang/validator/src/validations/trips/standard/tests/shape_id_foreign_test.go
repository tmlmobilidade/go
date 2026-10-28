package trips_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/trips/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/trips/utils"
	"main/types"
	"testing"
)

func TestShapeIdForeign(t *testing.T) {
	const id = "trips_shape_id_foreign"
	for _, tc := range []struct {
		value string
		count int
	}{{"R1_0", 0},
		{"", 0}, {"missing", 1}, {"' OR 1=1 --", 1}} {
		t.Run(tc.value, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"shape_id": tc.value}, config)
			if err := checks.ShapeIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "shape_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "shape_id", checks.ShapeIdForeign, map[string]any{"shape_id": "missing"})
}

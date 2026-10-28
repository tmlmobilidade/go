package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
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
			config := validationutils.TripsConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.TripsFixture(t, map[string]any{"shape_id": tc.value}, config)
			if err := standard.ShapeIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.TripsAssertFindings(t, id, "shape_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.TripsCheckInvalid(t, id, "shape_id", standard.ShapeIdForeign, map[string]any{"shape_id": "missing"})
}

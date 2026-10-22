package transfers_fields_test

import (
	"main/types"
	checks "main/validations/transfers/fields/checks"
	testutils "main/validations/transfers/utils"
	"testing"
)

func TestToRouteIdField(t *testing.T) {
	testutils.CheckPresence(t, "to_route_id", checks.ToRouteIdField)
}
func TestToRouteIdFieldTripSuppliesRoute(t *testing.T) {
	const id = "transfers_to_route_id_field"
	config := testutils.Config(id, types.SEVERITY_ERROR)
	_, ctx := testutils.Fixture(t, map[string]any{"to_trip_id": "T1"}, config)
	if err := checks.ToRouteIdField(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	testutils.AssertFindings(t, id, "to_route_id", types.SEVERITY_ERROR, 0)
}

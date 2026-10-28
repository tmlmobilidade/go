package transfers_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/transfers/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/transfers/utils"
	"main/types"
	"testing"
)

func TestFromRouteIdField(t *testing.T) {
	testutils.CheckPresence(t, "from_route_id", checks.FromRouteIdField)
}
func TestFromRouteIdFieldTripSuppliesRoute(t *testing.T) {
	const id = "transfers_from_route_id_field"
	config := testutils.Config(id, types.SEVERITY_ERROR)
	_, ctx := testutils.Fixture(t, map[string]any{"from_trip_id": "T1"}, config)
	if err := checks.FromRouteIdField(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	testutils.AssertFindings(t, id, "from_route_id", types.SEVERITY_ERROR, 0)
}

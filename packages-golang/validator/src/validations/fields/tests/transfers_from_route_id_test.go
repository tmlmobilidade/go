package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestFromRouteIdField(t *testing.T) {
	validationutils.TransfersCheckPresence(t, "from_route_id", fields.FromRouteIdField)
}
func TestFromRouteIdFieldTripSuppliesRoute(t *testing.T) {
	const id = "transfers_from_route_id_field"
	config := validationutils.TransfersConfig(id, types.SEVERITY_ERROR)
	_, ctx := validationutils.TransfersFixture(t, map[string]any{"from_trip_id": "T1"}, config)
	if err := fields.FromRouteIdField(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	validationutils.TransfersAssertFindings(t, id, "from_route_id", types.SEVERITY_ERROR, 0)
}

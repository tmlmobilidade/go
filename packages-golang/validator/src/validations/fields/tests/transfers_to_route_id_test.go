package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestToRouteIdField(t *testing.T) {
	validationutils.TransfersCheckPresence(t, "to_route_id", fields.ToRouteIdField)
}
func TestToRouteIdFieldTripSuppliesRoute(t *testing.T) {
	const id = "transfers_to_route_id_field"
	config := validationutils.TransfersConfig(id, types.SEVERITY_ERROR)
	_, ctx := validationutils.TransfersFixture(t, map[string]any{"to_trip_id": "T1"}, config)
	if err := fields.ToRouteIdField(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	validationutils.TransfersAssertFindings(t, id, "to_route_id", types.SEVERITY_ERROR, 0)
}

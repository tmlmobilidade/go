package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestFromTripIdField(t *testing.T) {
	validationutils.TransfersCheckPresence(t, "from_trip_id", fields.FromTripIdField)
}
func TestFromTripIdFieldInSeatTypes(t *testing.T) {
	const id = "transfers_from_trip_id_field"
	for _, kind := range []string{"4", "5", "04"} {
		t.Run(kind, func(t *testing.T) {
			config := validationutils.TransfersConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.TransfersFixture(t, map[string]any{"from_trip_id": nil, "transfer_type": kind}, config)
			if err := fields.FromTripIdField(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.TransfersAssertFindings(t, id, "from_trip_id", types.SEVERITY_ERROR, 1)
		})
	}
}

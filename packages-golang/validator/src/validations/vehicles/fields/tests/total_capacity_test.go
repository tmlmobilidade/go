package vehicles_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/vehicles/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/vehicles/utils"
	"testing"
)

func TestTotalCapacityField(t *testing.T) {
	testutils.CheckPresence(t, "total_capacity", checks.TotalCapacityField)
}

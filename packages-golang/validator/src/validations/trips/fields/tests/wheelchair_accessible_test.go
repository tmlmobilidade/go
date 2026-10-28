package trips_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/trips/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/trips/utils"
	"testing"
)

func TestWheelchairAccessibleField(t *testing.T) {
	testutils.CheckPresence(t, "wheelchair_accessible", checks.WheelchairAccessibleField)
}

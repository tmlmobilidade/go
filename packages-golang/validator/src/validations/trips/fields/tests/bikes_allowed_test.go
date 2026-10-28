package trips_fields_test

import (
	checks "main/validations/trips/fields/checks"
	testutils "main/validations/trips/utils"
	"testing"
)

func TestBikesAllowedField(t *testing.T) {
	testutils.CheckPresence(t, "bikes_allowed", checks.BikesAllowedField)
}

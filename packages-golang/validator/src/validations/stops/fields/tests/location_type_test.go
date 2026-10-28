package stops_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestLocationTypeField(t *testing.T) {
	testutils.CheckPresence(t, "location_type", checks.LocationTypeField, 1)
}

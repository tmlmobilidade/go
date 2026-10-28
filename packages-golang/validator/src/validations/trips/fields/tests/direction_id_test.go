package trips_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/trips/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/trips/utils"
	"testing"
)

func TestDirectionIdField(t *testing.T) {
	testutils.CheckPresence(t, "direction_id", checks.DirectionIdField)
}

package stops_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestMunicipalityIdField(t *testing.T) {
	testutils.CheckPresence(t, "municipality_id", checks.MunicipalityIdField, 1)
}

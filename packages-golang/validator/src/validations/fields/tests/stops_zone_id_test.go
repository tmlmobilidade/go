package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestZoneIdField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "zone_id", fields.ZoneIdField, 0)
}

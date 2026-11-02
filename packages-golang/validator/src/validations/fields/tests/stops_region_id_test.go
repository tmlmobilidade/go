package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestRegionIdField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "region_id", fields.RegionIdField, 1)
}

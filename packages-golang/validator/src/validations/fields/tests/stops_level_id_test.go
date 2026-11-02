package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestStopsLevelIdField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "level_id", fields.StopsLevelIdField, 1)
}

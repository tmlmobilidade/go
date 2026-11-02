package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestPathwaysFromStopIdField(t *testing.T) {
	validationutils.PathwaysCheckPresence(t, "from_stop_id", fields.PathwaysFromStopIdField)
}

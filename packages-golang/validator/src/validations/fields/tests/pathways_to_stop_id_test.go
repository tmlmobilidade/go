package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestPathwaysToStopIdField(t *testing.T) {
	validationutils.PathwaysCheckPresence(t, "to_stop_id", fields.PathwaysToStopIdField)
}

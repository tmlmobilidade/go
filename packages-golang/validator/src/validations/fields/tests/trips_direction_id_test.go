package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestDirectionIdField(t *testing.T) {
	validationutils.TripsCheckPresence(t, "direction_id", fields.DirectionIdField)
}

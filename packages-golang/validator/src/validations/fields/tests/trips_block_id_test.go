package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestBlockIdField(t *testing.T) {
	validationutils.TripsCheckPresence(t, "block_id", fields.BlockIdField)
}

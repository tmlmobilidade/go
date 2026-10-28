package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestHasBenchField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "has_bench", fields.HasBenchField, 1)
}

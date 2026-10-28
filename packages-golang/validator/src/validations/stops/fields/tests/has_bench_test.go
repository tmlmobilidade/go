package stops_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestHasBenchField(t *testing.T) {
	testutils.CheckPresence(t, "has_bench", checks.HasBenchField, 1)
}

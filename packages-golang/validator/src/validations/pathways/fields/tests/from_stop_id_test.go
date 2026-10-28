package pathways_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/pathways/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/pathways/utils"
	"testing"
)

func TestFromStopIdField(t *testing.T) {
	testutils.CheckPresence(t, "from_stop_id", checks.FromStopIdField)
}

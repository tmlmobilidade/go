package pathways_fields_test

import (
	checks "main/validations/pathways/fields/checks"
	testutils "main/validations/pathways/utils"
	"testing"
)

func TestFromStopIdField(t *testing.T) {
	testutils.CheckPresence(t, "from_stop_id", checks.FromStopIdField)
}

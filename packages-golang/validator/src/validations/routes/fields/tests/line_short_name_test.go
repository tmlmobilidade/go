package routes_fields_test

import (
	checks "main/validations/routes/fields/checks"
	testutils "main/validations/routes/utils"
	"testing"
)

func TestLineShortNameField(t *testing.T) {
	testutils.CheckPresence(t, "line_short_name", checks.LineShortNameField)
}

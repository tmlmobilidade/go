package routes_fields_test

import (
	checks "main/validations/routes/fields/checks"
	testutils "main/validations/routes/utils"
	"testing"
)

func TestLineLongNameField(t *testing.T) {
	testutils.CheckPresence(t, "line_long_name", checks.LineLongNameField)
}

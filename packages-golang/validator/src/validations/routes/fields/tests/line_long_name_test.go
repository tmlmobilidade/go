package routes_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/routes/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/routes/utils"
	"testing"
)

func TestLineLongNameField(t *testing.T) {
	testutils.CheckPresence(t, "line_long_name", checks.LineLongNameField)
}

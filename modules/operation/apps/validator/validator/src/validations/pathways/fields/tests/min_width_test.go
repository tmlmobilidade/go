package pathways_fields_test

import (
	checks "main/validations/pathways/fields/checks"
	testutils "main/validations/pathways/utils"
	"testing"
)

func TestMinWidthField(t *testing.T) { testutils.CheckPresence(t, "min_width", checks.MinWidthField) }

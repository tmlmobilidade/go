package routes_fields_test

import (
	checks "main/validations/routes/fields/checks"
	testutils "main/validations/routes/utils"
	"testing"
)

func TestPathTypeField(t *testing.T) { testutils.CheckPresence(t, "path_type", checks.PathTypeField) }

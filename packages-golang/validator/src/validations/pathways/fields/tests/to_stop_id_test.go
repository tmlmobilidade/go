package pathways_fields_test

import (
	checks "main/validations/pathways/fields/checks"
	testutils "main/validations/pathways/utils"
	"testing"
)

func TestToStopIdField(t *testing.T) { testutils.CheckPresence(t, "to_stop_id", checks.ToStopIdField) }

package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestLevelIdField(t *testing.T) {
	testutils.CheckPresence(t, "level_id", checks.LevelIdField, 1)
}

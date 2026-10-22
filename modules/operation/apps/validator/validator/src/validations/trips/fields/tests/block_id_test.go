package trips_fields_test

import (
	checks "main/validations/trips/fields/checks"
	testutils "main/validations/trips/utils"
	"testing"
)

func TestBlockIdField(t *testing.T) { testutils.CheckPresence(t, "block_id", checks.BlockIdField) }

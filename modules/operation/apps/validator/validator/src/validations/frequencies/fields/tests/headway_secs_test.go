package frequencies_fields_test

import (
	checks "main/validations/frequencies/fields/checks"
	testutils "main/validations/frequencies/utils"
	"testing"
)

func TestHeadwaySecsField(t *testing.T) {
	testutils.CheckPresence(t, "headway_secs", checks.HeadwaySecsField)
}

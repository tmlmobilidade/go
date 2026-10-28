package frequencies_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/frequencies/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/frequencies/utils"
	"testing"
)

func TestHeadwaySecsField(t *testing.T) {
	testutils.CheckPresence(t, "headway_secs", checks.HeadwaySecsField)
}

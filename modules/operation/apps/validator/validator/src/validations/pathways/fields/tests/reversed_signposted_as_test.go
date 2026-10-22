package pathways_fields_test

import (
	checks "main/validations/pathways/fields/checks"
	testutils "main/validations/pathways/utils"
	"testing"
)

func TestReversedSignpostedAsField(t *testing.T) {
	testutils.CheckPresence(t, "reversed_signposted_as", checks.ReversedSignpostedAsField)
}

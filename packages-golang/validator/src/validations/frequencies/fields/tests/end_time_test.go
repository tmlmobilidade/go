package frequencies_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/frequencies/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/frequencies/utils"
	"testing"
)

func TestEndTimeField(t *testing.T) { testutils.CheckPresence(t, "end_time", checks.EndTimeField) }

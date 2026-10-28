package fare_attributes_fields_test

import (
	checks "main/validations/fare_attributes/fields/checks"
	testutils "main/validations/fare_attributes/utils"
	"testing"
)

func TestPriceField(t *testing.T) { testutils.CheckPresence(t, "price", checks.PriceField) }

package test_helpers

import (
	"main/lib"
	"main/types"
	"strconv"
)

// ===============================================
// GENERIC TEST CASE STRUCTURES
// ===============================================

// GenericFieldTestCase is a universal test case for single field validation
type GenericFieldTestCase struct {
	Name             string
	Value            interface{} // Can be *string, *int, or any pointer type
	Row              int
	Rules            interface{} // Optional rules configuration
	ExpectedErrors   int
	ExpectedWarnings int
	ExpectedCodes    []string
}

// GenericRequiredFieldTestCase for testing required/recommended field patterns
type GenericRequiredFieldTestCase struct {
	Name             string
	Value            *string
	Row              int
	IsRequired       bool // Row 1 = required, Row 2+ = recommended (by convention)
	ExpectedErrors   int
	ExpectedWarnings int
	ExpectedCode     string
}

// GenericUrlTestCase for URL validation patterns
type GenericUrlTestCase struct {
	Name             string
	Url              *string
	Row              int
	ExpectedErrors   int
	ExpectedWarnings int
	ExpectedCode     string
}

// GenericColorTestCase for color field validation (6 char hex)
type GenericColorTestCase struct {
	Name             string
	Color            *string
	Row              int
	Severity         string // "error", "warning"
	ExpectedErrors   int
	ExpectedWarnings int
}

// GenericEnumTestCase for enum/option field validation
type GenericEnumTestCase struct {
	Name             string
	Value            interface{} // Can be *int or *string
	ValidOptions     []int
	Row              int
	ExpectedErrors   int
	ExpectedWarnings int
}

// GenericEnumFloat32TestCase for float32 enum validation
type GenericEnumFloat32TestCase struct {
	Name             string
	Value            *float32
	ValidOptions     []float32
	Row              int
	ExpectedErrors   int
	ExpectedWarnings int
}

// GenericEnumFloat64TestCase for float64 enum validation
type GenericEnumFloat64TestCase struct {
	Name             string
	Value            *float64
	ValidOptions     []float64
	Row              int
	ExpectedErrors   int
	ExpectedWarnings int
}

// GenericIdTestCase for ID field validation (required, unique)
type GenericIdTestCase struct {
	Name           string
	Id             *string
	Row            int
	ExistingIds    map[string][]int // For duplicate detection
	ExpectedErrors int
	ExpectedCode   string
}

// GenericForeignKeyTestCase for foreign key validation
type GenericForeignKeyTestCase struct {
	Name           string
	Id             *string
	Row            int
	ExpectedErrors int
	ExpectedCode   string
}

// GenericSeverityTestCase for testing severity configurations
type GenericSeverityTestCase struct {
	Name             string
	Value            interface{}
	Severity         types.Severity // types.SEVERITY_ERROR, SEVERITY_WARNING, SEVERITY_IGNORE, SEVERITY_FORBIDDEN
	Row              int
	ExpectedErrors   int
	ExpectedWarnings int
}

// ===============================================
// GENERIC TEST CASE GENERATORS
// ===============================================

// GetGenericRequiredFieldTestCases returns test cases for required/recommended field patterns
func GetGenericRequiredFieldTestCases(fieldName string) []GenericRequiredFieldTestCase {
	return []GenericRequiredFieldTestCase{
		{
			Name:           "Required",
			Value:          nil,
			Row:            1,
			IsRequired:     true,
			ExpectedErrors: 1,
			ExpectedCode:   fieldName + "_required",
		},
		{
			Name:             "Recommended_Missing",
			Value:            nil,
			Row:              2,
			IsRequired:       false,
			ExpectedErrors:   0,
			ExpectedWarnings: 1,
			ExpectedCode:     fieldName + "_recommended",
		},
		{
			Name:           "Valid_Present",
			Value:          lib.Ptr("valid_value"),
			Row:            1,
			IsRequired:     true,
			ExpectedErrors: 0,
		},
		{
			Name:           "Invalid_Value",
			Value:          lib.Ptr(""),
			Row:            1,
			IsRequired:     true,
			ExpectedErrors: 1,
			ExpectedCode:   fieldName + "_required",
		},
	}
}

// GetGenericUrlTestCases returns comprehensive URL validation test cases
func GetGenericUrlTestCases(fieldName string) []GenericUrlTestCase {
	baseRow := 1

	cases := []GenericUrlTestCase{
		{
			Name:           "Valid_Url_Https",
			Url:            lib.Ptr("https://example.com"),
			Row:            baseRow,
			ExpectedErrors: 0,
		},
		{
			Name:           "Valid_Url_Http",
			Url:            lib.Ptr("http://example.com"),
			Row:            baseRow,
			ExpectedErrors: 0,
		},
		{
			Name:           "Valid_Url_With_Path",
			Url:            lib.Ptr("https://example.com/path/to/page"),
			Row:            baseRow,
			ExpectedErrors: 0,
		},
		{
			Name:           "Valid_Url_With_Query",
			Url:            lib.Ptr("https://example.com/page?param=value"),
			Row:            baseRow,
			ExpectedErrors: 0,
		},
		{
			Name:           "Invalid_Url_No_Protocol",
			Url:            lib.Ptr("example.com"),
			Row:            baseRow,
			ExpectedErrors: 1,
		},
		{
			Name:           "Invalid_Url_No_Host",
			Url:            lib.Ptr("https://"),
			Row:            baseRow,
			ExpectedErrors: 1,
		},
		{
			Name:           "Invalid_Url_Malformed",
			Url:            lib.Ptr("not-a-url"),
			Row:            baseRow,
			ExpectedErrors: 1,
		},
		{
			Name:           "Invalid_Url_With_Space",
			Url:            lib.Ptr("https://example.com/path with space"),
			Row:            baseRow,
			ExpectedErrors: 1,
		},
		{
			Name:           "Invalid_Url_Special_Characters",
			Url:            lib.Ptr("https://example.com/<script>"),
			Row:            baseRow,
			ExpectedErrors: 1,
		},
	}

	// Add required/missing cases
	cases = append([]GenericUrlTestCase{
		{
			Name:           "Required_Missing",
			Url:            nil,
			Row:            1,
			ExpectedErrors: 1,
			ExpectedCode:   fieldName + "_required",
		},
	}, cases...)

	return cases
}

// GetGenericColorTestCases returns test cases for hex color validation
func GetGenericColorTestCases(fieldName string) []GenericColorTestCase {
	return []GenericColorTestCase{
		{
			Name:           "Valid_Color_Uppercase",
			Color:          lib.Ptr("FFFFFF"),
			Row:            1,
			ExpectedErrors: 0,
		},
		{
			Name:           "Valid_Color_Lowercase",
			Color:          lib.Ptr("ffffff"),
			Row:            1,
			ExpectedErrors: 0,
		},
		{
			Name:           "Valid_Color_Mixed",
			Color:          lib.Ptr("123AbC"),
			Row:            1,
			ExpectedErrors: 0,
		},
		{
			Name:           "Valid_Color_Black",
			Color:          lib.Ptr("000000"),
			Row:            1,
			ExpectedErrors: 0,
		},
		{
			Name:           "Invalid_Color_Too_Short",
			Color:          lib.Ptr("FFF"),
			Row:            2,
			ExpectedErrors: 1,
		},
		{
			Name:           "Invalid_Color_Too_Long",
			Color:          lib.Ptr("FFFFFFF"),
			Row:            3,
			ExpectedErrors: 1,
		},
		{
			Name:           "Invalid_Color_Bad_Characters",
			Color:          lib.Ptr("ZZZZZZ"),
			Row:            4,
			ExpectedErrors: 1,
		},
		{
			Name:           "Invalid_Color_With_Hash",
			Color:          lib.Ptr("#FFFFFF"),
			Row:            5,
			ExpectedErrors: 1,
		},
		{
			Name:           "Nil_Color_Optional",
			Color:          nil,
			Row:            7,
			ExpectedErrors: 0,
		},
	}
}

// GetGenericEnumIntTestCases returns test cases for integer enum validation
func GetGenericEnumIntTestCases(fieldName string, validOptions []int) []GenericEnumTestCase {
	cases := []GenericEnumTestCase{
		{
			Name:           "Missing_Value_Required",
			Value:          (*int)(nil),
			ValidOptions:   validOptions,
			Row:            1,
			ExpectedErrors: 1,
		},
	}

	// Add valid cases for each option
	for i, opt := range validOptions {
		val := opt
		cases = append(cases, GenericEnumTestCase{
			Name:           "Valid_Option_" + string(rune('0'+opt)),
			Value:          &val,
			ValidOptions:   validOptions,
			Row:            i + 2,
			ExpectedErrors: 0,
		})
	}

	// Add invalid case
	invalidVal := 999
	cases = append(cases, GenericEnumTestCase{
		Name:           "Invalid_Option",
		Value:          &invalidVal,
		ValidOptions:   validOptions,
		Row:            len(validOptions),
		ExpectedErrors: 1,
	})

	return cases
}

// GetGenericEnumFloat32TestCases returns test cases for float32 enum validation
func GetGenericEnumFloat32TestCases(fieldName string, validOptions []float32) []GenericEnumFloat32TestCase {
	cases := []GenericEnumFloat32TestCase{
		{
			Name:           "Missing_Value_Required",
			Value:          (*float32)(nil),
			ValidOptions:   validOptions,
			Row:            1,
			ExpectedErrors: 1,
		},
	}

	// Add valid cases for each option
	for i, opt := range validOptions {
		val := opt
		cases = append(cases, GenericEnumFloat32TestCase{
			Name:           "Valid_Option_" + strconv.FormatFloat(float64(opt), 'f', -1, 32),
			Value:          &val,
			ValidOptions:   validOptions,
			Row:            i + 2,
			ExpectedErrors: 0,
		})
	}

	// Add invalid case
	invalidVal := float32(999)
	cases = append(cases, GenericEnumFloat32TestCase{
		Name:           "Invalid_Option",
		Value:          &invalidVal,
		ValidOptions:   validOptions,
		Row:            len(validOptions),
		ExpectedErrors: 1,
	})

	return cases
}

// GetGenericEnumFloat64TestCases returns test cases for float64 enum validation
func GetGenericEnumFloat64TestCases(fieldName string, validOptions []float64) []GenericEnumFloat64TestCase {
	cases := []GenericEnumFloat64TestCase{
		{
			Name:           "Missing_Value_Required",
			Value:          (*float64)(nil),
			ValidOptions:   validOptions,
			Row:            1,
			ExpectedErrors: 1,
		},
	}

	// Add valid cases for each option
	for i, opt := range validOptions {
		val := opt
		cases = append(cases, GenericEnumFloat64TestCase{
			Name:           "Valid_Option_" + strconv.FormatFloat(float64(opt), 'f', -1, 64),
			Value:          &val,
			ValidOptions:   validOptions,
			Row:            i + 2,
			ExpectedErrors: 0,
		})
	}

	// Add invalid case
	invalidVal := float64(999)
	cases = append(cases, GenericEnumFloat64TestCase{
		Name:           "Invalid_Option",
		Value:          &invalidVal,
		ValidOptions:   validOptions,
		Row:            len(validOptions),
		ExpectedErrors: 1,
	})

	return cases
}

// GetGenericIdTestCases returns test cases for ID validation
func GetGenericIdTestCases(fieldName string) []GenericIdTestCase {
	return []GenericIdTestCase{
		{
			Name:           "Required Id",
			Id:             nil,
			Row:            1,
			ExistingIds:    nil,
			ExpectedErrors: 1,
			ExpectedCode:   fieldName + "_id_required",
		},
		{
			Name:           "Valid_Unique",
			Id:             lib.Ptr("unique_id"),
			Row:            1,
			ExistingIds:    map[string][]int{"unique_id": {0}},
			ExpectedErrors: 0,
		},
		{
			Name:           "Duplicate_Id",
			Id:             lib.Ptr("dup_id"),
			Row:            2,
			ExistingIds:    map[string][]int{"dup_id": {0, 2}},
			ExpectedErrors: 1,
		},
	}
}

// GetGenericForeignKeyTestCases returns test cases for foreign key validation
func GetGenericForeignKeyTestCases(fieldName string) []GenericForeignKeyTestCase {
	return []GenericForeignKeyTestCase{
		{
			Name:           "ForeignKey_Present",
			Id:             lib.Ptr("present_id"),
			Row:            0,
			ExpectedErrors: 0,
		},
		{
			Name:           "ForeignKey_Invalid",
			Id:             lib.Ptr("invalid_id"),
			Row:            0,
			ExpectedErrors: 1,
		},
	}
}

// GetGenericSeverityTestCases returns test cases for different severity levels
func GetGenericSeverityTestCases(fieldName string) []GenericSeverityTestCase {
	return []GenericSeverityTestCase{
		{
			Name:           "Severity_Error_Missing",
			Value:          (*string)(nil),
			Severity:       types.SEVERITY_ERROR,
			Row:            1,
			ExpectedErrors: 1,
		},
		{
			Name:             "Severity_Warning_Missing",
			Value:            (*string)(nil),
			Severity:         types.SEVERITY_WARNING,
			Row:              2,
			ExpectedWarnings: 1,
		},
		{
			Name:             "Severity_Ignore_Missing",
			Value:            (*string)(nil),
			Severity:         types.SEVERITY_IGNORE,
			Row:              3,
			ExpectedErrors:   0,
			ExpectedWarnings: 0,
		},
		{
			Name:             "Severity_Forbidden_Missing",
			Value:            (*string)(nil),
			Severity:         types.SEVERITY_FORBIDDEN,
			Row:              5,
			ExpectedErrors:   0,
			ExpectedWarnings: 0,
		},
	}
}

// ===============================================
// ARRAYS VALUE GENERATORS
// ===============================================

// GetBinaryValidOptions returns valid binary values
func GetBinaryValidOptions() []int {
	return []int{0, 1}
}

// GetThreeStateValidOptions returns valid three-state values
func GetThreeStateValidOptions() []int {
	return []int{0, 1, 2}
}

// GetFourStateValidOptions returns valid four-state values
func GetFourStateValidOptions() []int {
	return []int{0, 1, 2, 3}
}

// GetRouteTypeValidOptions returns valid GTFS route_type values
func GetRouteTypeValidOptions() []int {
	return []int{0, 1, 2, 3, 4, 5, 6, 7, 11, 12}
}

// GetLocationTypeValidOptions returns valid location_type values for stops
func GetLocationTypeValidOptions() []int {
	return []int{0, 1, 2, 3, 4}
}

// GetValidShapeOptions returns valid shape_pt_sequence values
func GetValidShapeOptions() []int {
	return []int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
}

// GetInvalidShapeOptions returns invalid shape_pt_sequence values
func GetInvalidShapeOptions() []int {
	return []int{-1, -2, -3, -4, -5, -6, -7, -8, -9, -10}
}

// GetShapeFloat64ValidOptions returns valid float64 values
func GetShapeFloat64ValidOptions() []float64 {
	return []float64{0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0}
}

// GetShapeFloat64InvalidOptions returns invalid float64 values
func GetShapeFloat64InvalidOptions() []float64 {
	return []float64{-1.0, -2.0, -3.0, -4.0, -5.0, -6.0, -7.0, -8.0, -9.0, -10.0}
}

// GetTypologyValidOptions returns valid typology values
func GetTypologyValidOptions() []float64 {
	return []float64{0.1, 0.2, 0.3, 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 7.1, 7.2, 7.3}
}

// GetPropulsionValidOptions returns valid propulsion values
func GetPropulsionValidOptions() []int {
	return []int{1, 2, 3, 4, 5, 6, 7, 8}
}

// GetEmissionValidOptions returns valid emission values
func GetEmissionValidOptions() []int {
	return []int{1, 2, 3, 4, 5, 6}
}

// ===============================================
// TEST NUMBERS VALUE GENERATORS
// ===============================================

// GetValidIntOptions returns valid int values
func GetValidIntOptions() []int {
	return []int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
}

// GetInvalidIntOptions returns invalid int values
func GetInvalidIntOptions() []int {
	return []int{-1, -2, -3, -4, -5, -6, -7, -8, -9, -10}
}

// GetFloat32ValidOptions returns valid float32 values
func GetFloat32ValidOptions() []float32 {
	return []float32{0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0}
}

// GetFloat32InvalidOptions returns invalid float32 values
func GetFloat32InvalidOptions() []float32 {
	return []float32{-1.0, -2.0, -3.0, -4.0, -5.0, -6.0, -7.0, -8.0, -9.0, -10.0}
}

// GetFloat64ValidOptions returns valid float64 values
func GetFloat64ValidOptions() []float64 {
	return []float64{0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0}
}

// GetFloat64InvalidOptions returns invalid float64 values
func GetFloat64InvalidOptions() []float64 {
	return []float64{-1.0, -2.0, -3.0, -4.0, -5.0, -6.0, -7.0, -8.0, -9.0, -10.0}
}

// ===============================================
// TEST SPECIFICS VALUE GENERATORS
// ===============================================

// GetValidTimeOptions returns valid time values
func GetValidTimeOptions() []string {
	return []string{
		"00:00:00",
		"00:00:01",
		"00:00:02",
	}
}

// GetInvalidTimeOptions returns invalid time values
func GetInvalidTimeOptions() []string {
	return []string{
		"25:00:00",
		"00:60:00",
		"00:00:60",
		"00:00:000",
		"00:00:0000",
		"00:00:00000",
		"00:00:000000",
		"00:00:0000000",
		"00:00:00000000",
	}
}

// ===============================================
// COMMON TEST VALUE GENERATORS
// ===============================================

// GetValidIds returns valid IDs for testing
func GetValidIds() []string {
	return []string{
		"valid_id",
		"valid_id_2",
		"valid_id_3",
	}
}

// ValidTimezones returns a list of valid IANA timezones for testing
func GetValidTimezones() []string {
	return []string{
		"America/New_York",
		"America/Los_Angeles",
		"America/Chicago",
		"Europe/London",
		"Europe/Paris",
		"Europe/Lisbon",
		"Asia/Tokyo",
		"Asia/Shanghai",
		"Australia/Sydney",
		"Pacific/Auckland",
		"UTC",
	}
}

// GetInvalidTimezones returns invalid timezone strings for testing
func GetInvalidTimezones() []string {
	return []string{
		"Invalid/Timezone",
		"Not_A_Timezone",
		"America",
		"UTC+5",
		"EST",
		"PST",
	}
}

// GetValidLanguageCodes returns valid BCP-47 language codes
func GetValidLanguageCodes() []string {
	return []string{
		"en",
		"en-US",
		"en-GB",
		"pt",
		"pt-PT",
		"pt-BR",
		"es",
		"fr",
		"de",
		"zh",
		"ja",
	}
}

// GetInvalidLanguageCodes returns invalid language codes
func GetInvalidLanguageCodes() []string {
	return []string{
		"invalid-lang",
		"english",
		"123",
		"en_US",
		"",
	}
}

// GetValidEmails returns valid email addresses for testing
func GetValidEmails() []string {
	return []string{
		"test@example.com",
		"user.name@domain.org",
		"contact+tag@company.co.uk",
		"admin@subdomain.example.com",
	}
}

// GetInvalidEmails returns invalid email addresses for testing
func GetInvalidEmails() []string {
	return []string{
		"invalid-email",
		"@domain.com",
		"user@",
		"user@.com",
		"user name@domain.com",
		"user@domain",
	}
}

// GetValidPhoneNumbers returns sample phone numbers for testing
func GetValidPhoneNumbers() []string {
	return []string{
		"987-654-321",
		"987654321",
	}
}

// GetValidUrls returns sample valid URLs for testing
func GetValidUrls() []string {
	return []string{
		"https://example.com",
		"http://example.org",
		"https://www.example.com/path",
		"https://example.com/page?query=value",
		"https://subdomain.example.com",
	}
}

// GetInvalidUrls returns sample invalid URLs for testing
func GetInvalidUrls() []string {
	return []string{
		"invalid-url",
		"not a url",
		"ftp://example.com",
		"//example.com",
		"example.com",
		"https://",
		"https://example.com/path with space",
	}
}

// GetDateValidOptions returns valid date values
func GetDateValidOptions() []string {
	return []string{
		"20240101",
		"20240102",
		"20240103",
	}
}

// GetInvalidDateOptions returns invalid date values
func GetInvalidDateOptions() []string {
	return []string{
		"2024-01-01",
		"2024010101",
		"202401010101",
		"20240101010101",
		"2024010101010101",
		"202401010101010101",
		"20240101010101010101",
		"2024010101010101010101",
		"202401010101010101010101",
	}
}

// ===============================================
// TEST CASE COUNT SUMMARY
// ===============================================

// TestCaseSummary provides counts of all available test cases
type TestCaseSummary struct {
	RequiredFieldCases int
	UrlCases           int
	ColorCases         int
	EnumCases          int
	IdCases            int
	FkCases            int
	SeverityCases      int
	TotalCases         int
}

// GetTestCaseSummary returns a summary of all available generic test cases
func GetTestCaseSummary() TestCaseSummary {
	requiredCases := len(GetGenericRequiredFieldTestCases("sample"))
	urlCases := len(GetGenericUrlTestCases("sample"))
	colorCases := len(GetGenericColorTestCases("sample"))
	enumCases := len(GetGenericEnumIntTestCases("sample", []int{0, 1, 2}))
	idCases := len(GetGenericIdTestCases("sample"))
	severityCases := len(GetGenericSeverityTestCases("sample"))
	fkCases := len(GetGenericForeignKeyTestCases("sample"))

	return TestCaseSummary{
		RequiredFieldCases: requiredCases,
		UrlCases:           urlCases,
		ColorCases:         colorCases,
		EnumCases:          enumCases,
		IdCases:            idCases,
		FkCases:            fkCases,
		SeverityCases:      severityCases,
		TotalCases:         requiredCases + urlCases + colorCases + enumCases + idCases + fkCases + severityCases,
	}
}

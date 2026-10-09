package lib

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"main/i18n"
	"maps"
	"reflect"
	"strconv"
)

// ParseStringToPrimitive converts a string to a primitive type and stores it in the provided pointer.
// If the string is empty, the function returns without modifying the target value.
// If parsing fails, an error message is appended to the provided errors slice.
//
// The function supports the following primitive types:
//   - string
//   - int8, int16, int32, int64, int
//   - uint8, uint16, uint32, uint64, uint
//   - float32, float64
//   - bool
//
// If an unsupported type is provided, the function will panic with an error message.
//
//	@param str string - The string to parse
//	@param t *T - Pointer to the target variable where the parsed value will be stored
//	@return msg string - The error message if parsing fails, empty string otherwise
func ParseStringToPrimitive[T any](str string, t *T) (msg string) {
	if str == "" {
		return
	}

	switch any(*t).(type) {
	case string:
		*t = any(str).(T)
		return
	case int8:
		f, err := strconv.ParseInt(str, 10, 8)
		if err != nil {
			return i18n.AppTranslator.Get("parser.int8", str)
		}
		*t = any(int8(f)).(T)
		return
	case int16:
		f, err := strconv.ParseInt(str, 10, 16)
		if err != nil {
			return i18n.AppTranslator.Get("parser.int16", str)
		}
		*t = any(int16(f)).(T)
		return
	case int32:
		f, err := strconv.ParseInt(str, 10, 32)
		if err != nil {
			return i18n.AppTranslator.Get("parser.int32", str)
		}
		*t = any(int32(f)).(T)
		return
	case int64:
		f, err := strconv.ParseInt(str, 10, 64)
		if err != nil {
			return i18n.AppTranslator.Get("parser.int64", str)
		}
		*t = any(int64(f)).(T)
		return
	case int:
		f, err := strconv.ParseInt(str, 10, 64)
		if err != nil {
			return i18n.AppTranslator.Get("parser.int", str)
		}
		*t = any(int(f)).(T)
		return
	case uint8:
		f, err := strconv.ParseUint(str, 10, 8)
		if err != nil {
			return i18n.AppTranslator.Get("parser.uint8", str)
		}
		*t = any(uint8(f)).(T)
		return
	case uint16:
		f, err := strconv.ParseUint(str, 10, 16)
		if err != nil {
			return i18n.AppTranslator.Get("parser.uint16", str)
		}
		*t = any(uint16(f)).(T)
		return
	case uint32:
		f, err := strconv.ParseUint(str, 10, 32)
		if err != nil {
			return i18n.AppTranslator.Get("parser.uint32", str)
		}
		*t = any(uint32(f)).(T)
		return
	case uint64:
		f, err := strconv.ParseUint(str, 10, 64)
		if err != nil {
			return i18n.AppTranslator.Get("parser.uint64", str)
		}
		*t = any(uint64(f)).(T)
		return
	case uint:
		f, err := strconv.ParseUint(str, 10, 64)
		if err != nil {
			return i18n.AppTranslator.Get("parser.uint", str)
		}
		*t = any(uint(f)).(T)
		return
	case float32:
		f, err := strconv.ParseFloat(str, 32)
		if err != nil {
			return i18n.AppTranslator.Get("parser.float32", str)
		}
		*t = any(float32(f)).(T)
		return
	case float64:
		f, err := strconv.ParseFloat(str, 64)
		if err != nil {
			return i18n.AppTranslator.Get("parser.float64", str)
		}
		*t = any(f).(T)
		return
	case bool:
		f, err := strconv.ParseBool(str)
		if err != nil {
			return i18n.AppTranslator.Get("parser.bool", str)
		}
		*t = any(f).(T)
		return
	default:
		//Panic with error
		panic(i18n.AppTranslator.Get("parser.invalid_type", str, reflect.TypeOf(*t)))
	}
}

// PrintMap takes any value and prints it as indented JSON to stdout.
// If there is an error marshaling the value to JSON, it prints the error.
//
//	@param a any - The value to print as JSON
//	@param minify ...bool - Optional parameter to minify the output
func PrintMap(a any, minify ...bool) {
	shouldMinify := false

	if len(minify) > 0 {
		shouldMinify = minify[0]
	}

	if shouldMinify {
		b, err := json.Marshal(a)
		if err != nil {
			fmt.Println("error:", err)
		}
		fmt.Printf("%s\n", string(b))
	} else {
		b, err := json.MarshalIndent(a, "", "  ")
		if err != nil {
			fmt.Println("error:", err)
		}
		fmt.Printf("%s\n", string(b))
	}
}

// Returns a if condition is true, otherwise returns b
// Substitute for the ternary operator
//
//	@param condition bool - The condition to check
//	@param a T - The value to return if the condition is true
//	@param b T - The value to return if the condition is false
//	@return T - The value to return
func IfThenElse[T any](condition bool, a, b T) T {
	if condition {
		return a
	}
	return b
}

// MergeMaps merges two maps into a single map
//
//	@param a map[string]string - The first map
//	@param b map[string]string - The second map
//	@return map[string]string - The merged map
func MergeMaps[T any](a, b map[string]T) map[string]T {
	result := make(map[string]T)
	maps.Copy(result, a)
	maps.Copy(result, b)

	return result
}

// Removes duplicates from a slice
//
//	@param slice []T - The slice to remove duplicates from
//	@return []T - The slice with duplicates removed
func RemoveDuplicates[T any](slice []T) []T {
	seen := make(map[any]bool)
	result := make([]T, 0)

	for _, v := range slice {
		if !seen[v] {
			seen[v] = true
			result = append(result, v)
		}
	}
	return result
}

// Returns a pointer to T value
//
//	@param t T - The value to return a pointer to
//	@return *T - The pointer to the value
func Ptr[T any](t T) *T { return &t }

// Returns a hash of the values of a map
//
//	@param m map[string]any - The map to hash
//	@return string - The hash of the values of the map
func Hash(str string) string {
	return hex.EncodeToString(sha256.New().Sum([]byte(str)))
}

// GetAllStructTagValues retrieves all values of a tag from a struct
//
//	@param obj T - The struct to retrieve the tag values from
//	@param tagKey string - The tag key to retrieve the values from
//	@return []string - The values of the tag
func GetAllStructTagValues[T any](obj T, tagKey string) []string {
	v := reflect.ValueOf(obj)
	t := v.Type()

	values := make([]string, 0)

	for i := range v.NumField() {
		fieldType := t.Field(i)
		tag := fieldType.Tag.Get(tagKey)
		values = append(values, tag)
	}

	return values
}

// GetFieldByTag retrieves a field's value by its GTFS tag name from any struct
func GetFieldByTag[T any](obj *T, tagKey string, tagValue string) string {

	v := reflect.ValueOf(obj).Elem()
	t := v.Type()

	for i := range v.NumField() {
		field := v.Field(i)
		fieldType := t.Field(i)
		tag := fieldType.Tag.Get(tagKey)

		if tag == tagValue {
			return field.String()
		}
	}

	return ""
}

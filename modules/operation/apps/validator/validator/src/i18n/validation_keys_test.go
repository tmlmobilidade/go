package i18n

import (
	"go/ast"
	"go/parser"
	"go/token"
	"io/fs"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
)

// Check the actual call sites, including contexts for several rules in one file.
func TestValidationDetailTranslationsUseRuleIDs(t *testing.T) {
	translators := []*Translator{NewTranslator("en"), NewTranslator("es"), NewTranslator("pt")}
	check := func(key string, position token.Position) {
		for _, translator := range translators {
			if _, exists := translator.translations[key]; !exists {
				t.Errorf("%s: missing %s translation %s", position, translator.language, key)
			}
		}
	}
	err := filepath.WalkDir("..", func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.IsDir() || !strings.HasSuffix(path, ".go") || strings.HasSuffix(path, "_test.go") {
			return nil
		}
		positions := token.NewFileSet()
		file, err := parser.ParseFile(positions, path, nil, 0)
		if err != nil {
			return err
		}
		ast.Inspect(file, func(node ast.Node) bool {
			call, ok := node.(*ast.CallExpr)
			if !ok {
				return true
			}
			method, ok := call.Fun.(*ast.SelectorExpr)
			if !ok {
				return true
			}
			if method.Sel.Name == "Get" {
				if receiver, ok := method.X.(*ast.SelectorExpr); ok && receiver.Sel.Name == "AppTranslator" {
					if key, ok := call.Args[0].(*ast.BasicLit); ok {
						value, _ := strconv.Unquote(key.Value)
						// Primitive conversion errors are shared parser helpers, not rules.
						if !strings.HasPrefix(value, "parser.") {
							check(value, positions.Position(key.Pos()))
						}
					}
				}
				return true
			}
			if method.Sel.Name != "GetTranslatedMessage" && method.Sel.Name != "GetRequiredMessage" && method.Sel.Name != "GetSeverityMessage" {
				return true
			}
			// The helper's own forwarding calls do not construct a context.
			if filepath.Base(path) == "validation_context.go" {
				return true
			}
			context, ok := method.X.(*ast.Ident)
			if !ok || context.Obj == nil {
				t.Errorf("%s: cannot resolve validation context", positions.Position(call.Pos()))
				return true
			}
			assignment, ok := context.Obj.Decl.(*ast.AssignStmt)
			if !ok || len(assignment.Rhs) != 1 {
				t.Errorf("%s: cannot resolve context declaration", positions.Position(call.Pos()))
				return true
			}
			constructor, ok := assignment.Rhs[0].(*ast.CallExpr)
			if !ok || len(constructor.Args) < 3 {
				t.Errorf("%s: cannot resolve context constructor", positions.Position(call.Pos()))
				return true
			}
			ruleID, ok := resolveString(constructor.Args[2])
			if !ok {
				t.Errorf("%s: cannot resolve context rule ID", positions.Position(call.Pos()))
				return true
			}
			count := 1
			if method.Sel.Name == "GetRequiredMessage" {
				count = 2
			}
			if method.Sel.Name == "GetSeverityMessage" {
				count = 3
			}
			if len(call.Args) < count {
				t.Errorf("%s: missing detail keys", positions.Position(call.Pos()))
				return true
			}
			for _, argument := range call.Args[:count] {
				key, ok := argument.(*ast.BasicLit)
				if !ok {
					t.Errorf("%s: expected a literal detail key", positions.Position(argument.Pos()))
					continue
				}
				value, _ := strconv.Unquote(key.Value)
				if strings.Contains(value, ".") {
					t.Errorf("%s: use a detail key without a rule prefix: %s", positions.Position(key.Pos()), value)
				}
				check(ruleID+"."+value, positions.Position(key.Pos()))
			}
			return true
		})
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

// resolveString follows the declaration attached by the parser, so local ruleID
// constants remain scoped to their function rather than a file-wide name map.
func resolveString(expr ast.Expr) (string, bool) {
	return resolveStringSeen(expr, make(map[ast.Expr]bool))
}
func resolveStringSeen(expr ast.Expr, seen map[ast.Expr]bool) (string, bool) {
	if expr == nil || seen[expr] {
		return "", false
	}
	seen[expr] = true
	switch value := expr.(type) {
	case *ast.BasicLit:
		if value.Kind != token.STRING {
			return "", false
		}
		result, err := strconv.Unquote(value.Value)
		return result, err == nil
	case *ast.ParenExpr:
		return resolveStringSeen(value.X, seen)
	case *ast.Ident:
		if value.Obj == nil {
			return "", false
		}
		if declaration, ok := value.Obj.Decl.(*ast.ValueSpec); ok {
			for i, name := range declaration.Names {
				if name.Name == value.Name && i < len(declaration.Values) {
					return resolveStringSeen(declaration.Values[i], seen)
				}
			}
		}
	}
	return "", false
}

func TestResolveStringRuleIDs(t *testing.T) {
	source := `package example
const packageRule = "package_rule"
func first() {
 const ruleID = "first_rule"
 const alias = ruleID
 use("literal_rule")
 use(ruleID)
 use((alias))
 use(packageRule)
}
func second() {
 const ruleID = "second_rule"
 use(ruleID)
 use(unknown)
 use(42)
}
`
	file, err := parser.ParseFile(token.NewFileSet(), "fixture.go", source, 0)
	if err != nil {
		t.Fatal(err)
	}
	expected := []struct {
		value string
		ok    bool
	}{
		{"literal_rule", true}, {"first_rule", true}, {"first_rule", true},
		{"package_rule", true}, {"second_rule", true}, {"", false}, {"", false},
	}
	index := 0
	ast.Inspect(file, func(node ast.Node) bool {
		call, ok := node.(*ast.CallExpr)
		if !ok {
			return true
		}
		if index >= len(expected) {
			t.Fatal("unexpected call")
		}
		value, resolved := resolveString(call.Args[0])
		if value != expected[index].value || resolved != expected[index].ok {
			t.Errorf("call %d: got (%q,%v), want %+v", index, value, resolved, expected[index])
		}
		index++
		return true
	})
	if index != len(expected) {
		t.Fatalf("checked %d calls, want %d", index, len(expected))
	}
}

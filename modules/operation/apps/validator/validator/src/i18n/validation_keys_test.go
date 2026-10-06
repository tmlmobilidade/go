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
			if method.Sel.Name != "GetTranslatedMessage" && method.Sel.Name != "GetRequiredMessage" {
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
			ruleLiteral, ok := constructor.Args[2].(*ast.BasicLit)
			if !ok {
				t.Errorf("%s: cannot resolve context rule ID", positions.Position(call.Pos()))
				return true
			}
			ruleID, _ := strconv.Unquote(ruleLiteral.Value)
			count := 1
			if method.Sel.Name == "GetRequiredMessage" {
				count = 2
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

#!/bin/bash

# Check which shadcn/ui components are actually used in the codebase
echo "Checking UI component usage..."
echo "================================"

# Get all UI component files
UI_DIR="/Users/jaewookang/Downloads/jaewookng/projects/dermodel/src/components/ui"

# Create arrays to track usage
used_components=()
unused_components=()

# Check each component file
for file in "$UI_DIR"/*.tsx "$UI_DIR"/*.ts; do
    if [ -f "$file" ]; then
        filename=$(basename "$file" .tsx)
        filename=$(basename "$filename" .ts)
        
        # Skip certain files
        if [[ "$filename" == "use-toast" ]]; then
            continue
        fi
        
        # Search for imports of this component
        grep_result=$(grep -r "from ['\"]@/components/ui/$filename" /Users/jaewookang/Downloads/jaewookng/projects/dermodel/src --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "ui/$filename.tsx")
        
        if [ -n "$grep_result" ]; then
            used_components+=("$filename")
        else
            unused_components+=("$filename")
        fi
    fi
done

echo "USED COMPONENTS (${#used_components[@]}):"
for comp in "${used_components[@]}"; do
    echo "  ✅ $comp"
done

echo ""
echo "UNUSED COMPONENTS (${#unused_components[@]}):"
for comp in "${unused_components[@]}"; do
    echo "  ❌ $comp"
done

echo ""
echo "Recommendation: Remove ${#unused_components[@]} unused components"

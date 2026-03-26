import os
import json
import re

dump_file = r'd:\Revotic AI Development\Bi\work-platform\project_dump_utf8.txt'

files = {}
current_file = None
current_content = []

with open(dump_file, 'r', encoding='utf-8') as f:
    for line in f:
        match = re.match(r'^===== FILE: (.*?) =====\s*$', line)
        if match:
            if current_file:
                files[current_file] = ''.join(current_content)
            current_file = match.group(1).strip()
            current_content = []
        else:
            if current_file is not None:
                current_content.append(line)

if current_file:
    files[current_file] = ''.join(current_content)

print(f"Total files found: {len(files)}")

# 1. Structure
structure = list(files.keys())

# 2. Schema (Prisma)
schema_content = ""
for path, content in files.items():
    if path.endswith('schema.prisma'):
        schema_content = content
        break

# 3. Routes / API / Auth
routes = [p for p in files.keys() if 'app/api' in p.replace('\\', '/')]

# 4. UI / Components
components = [p for p in files.keys() if 'components' in p.replace('\\', '/')]
pages = [p for p in files.keys() if 'app' in p.replace('\\', '/') and p.endswith('page.tsx')]

output = {
    "file_count": len(files),
    "structure": structure,
    "schema": schema_content,
    "api_routes": routes,
    "components": components,
    "pages": pages,
}

# we can just write it to a json for analysis
with open('d:/Revotic AI Development/Bi/work-platform/dump_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2)

print("Analysis saved to dump_analysis.json")

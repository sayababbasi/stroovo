import json

output_file = r'd:\Revotic AI Development\Bi\work-platform\report_context.txt'

with open(r'd:\Revotic AI Development\Bi\work-platform\dump_analysis.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Open the full dump to extract the exact files we want
dump_file = r'd:\Revotic AI Development\Bi\work-platform\project_dump_utf8.txt'

import re
files = {}
current_file = None
current_content = []

with open(dump_file, 'r', encoding='utf-8') as f:
    for line in f:
        match = re.match(r'^===== FILE: (.*?) =====\s*$', line)
        if match:
            if current_file:
                files[current_file.replace('\\', '/')] = ''.join(current_content)
            current_file = match.group(1).strip()
            current_content = []
        else:
            if current_file is not None:
                current_content.append(line)

if current_file:
    files[current_file.replace('\\', '/')] = ''.join(current_content)

# Now compile contexts:
with open(output_file, 'w', encoding='utf-8') as out:
    out.write("====== PROJECT STRUCTURE ======\n")
    for f in sorted(files.keys()):
        out.write(f + "\n")
    
    out.write("\n====== PRISMA SCHEMA ======\n")
    schema_keys = [k for k in files.keys() if k.endswith('schema.prisma')]
    if schema_keys:
        out.write(files[schema_keys[0]])
    
    out.write("\n====== PACKAGE.JSON ======\n")
    pkg_keys = [k for k in files.keys() if k.endswith('package.json') and 'backend' not in k and 'frontend' not in k]
    if pkg_keys:
        out.write(files[pkg_keys[0]])
    else:
        pkg_keys = [k for k in files.keys() if k.endswith('package.json')]
        for k in pkg_keys:
            out.write(f"--- {k} ---\n")
            out.write(files[k])

    out.write("\n====== API ROUTES (First 20 Lines each) ======\n")
    api_routes = [k for k in files.keys() if 'api/' in k]
    for k in api_routes:
        out.write(f"--- {k} ---\n")
        lines = files[k].split('\n')[:20]
        out.write('\n'.join(lines) + '\n')

    out.write("\n====== PAGES (First 15 Lines each) ======\n")
    pages = [k for k in files.keys() if 'app/' in k and k.endswith('page.tsx')]
    for k in pages:
        out.write(f"--- {k} ---\n")
        lines = files[k].split('\n')[:15]
        out.write('\n'.join(lines) + '\n')

    out.write("\n====== SETTINGS/CONFIG ======\n")
    config_keys = [k for k in files.keys() if k.endswith('next.config.ts') or k.endswith('tsconfig.json') or k.endswith('.env')]
    for k in config_keys:
        out.write(f"--- {k} ---\n")
        out.write(files[k])

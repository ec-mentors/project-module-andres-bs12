import subprocess
import json

repo = 'ec-mentors/project-module-andres-bs12'

print("=== Cleaning up GitHub Issues ===")

# Fetch all issues
cmd = ['gh', 'issue', 'list', '--repo', repo, '--state', 'all', '--limit', '100', '--json', 'number,title,state']
res = subprocess.run(cmd, capture_output=True, text=True)
issues = json.loads(res.stdout)

# Sprint 2 keepers
keep_sprint_2 = [11, 12]

# Close all open issues except 11 and 12
for issue in issues:
    num = issue['number']
    state = issue['state']
    title = issue['title']
    
    if num not in keep_sprint_2 and state == 'OPEN':
        print(f"Closing Issue #{num}: {title}")
        subprocess.run(['gh', 'issue', 'close', str(num), '--repo', repo, '--comment', 'Cleaning up sprint scope per user request.'])

# Ensure Issue 12 is OPEN and in Sprint2
subprocess.run(['gh', 'issue', 'reopen', '12', '--repo', repo])
subprocess.run(['gh', 'issue', 'edit', '12', '--repo', repo, '--title', 'Refactor Boilerplate DTOs with Java Records & MapStruct', '--milestone', 'Sprint2', '--add-label', 'status: in-progress,type: refactor,backend'])

# Ensure Issue 11 is OPEN and in Sprint2
subprocess.run(['gh', 'issue', 'reopen', '11', '--repo', repo])
subprocess.run(['gh', 'issue', 'edit', '11', '--repo', repo, '--title', 'Investigate and Implement User Data Ownership Security (IDOR Protection)', '--milestone', 'Sprint2', '--add-label', 'status: todo,type: security,backend'])

# Create single Sprint 3 issue: "Definir Sprint 3"
s3_body = """## 🎯 Objetivo
Planificar y definir la estructura y componentes del Front-End para el Sprint 3.

## 📋 Ítems de Acción
- [ ] Definir tokens de diseño Figma (styles.css)
- [ ] Diseñar vistas principales (index.html, overview.html, goal.html)
- [ ] Planificar integración JavaScript con la REST API de Spring Boot
"""

cmd_s3 = ['gh', 'issue', 'create', '--repo', repo, '--title', 'Definir Sprint 3', '--body', s3_body, '--milestone', 'Sprint3', '--label', 'status: todo,type: feature,frontend']
res_s3 = subprocess.run(cmd_s3, capture_output=True, text=True)
s3_url = res_s3.stdout.strip()
print("Created Sprint 3 issue:", s3_url)

# Add to Project Board #3
subprocess.run(['gh', 'project', 'item-add', '3', '--owner', 'andres-bs12', '--url', 'https://github.com/ec-mentors/project-module-andres-bs12/issues/11'])
subprocess.run(['gh', 'project', 'item-add', '3', '--owner', 'andres-bs12', '--url', 'https://github.com/ec-mentors/project-module-andres-bs12/issues/12'])
subprocess.run(['gh', 'project', 'item-add', '3', '--owner', 'andres-bs12', '--url', s3_url])

print("=== Cleanup and Setup Complete ===")

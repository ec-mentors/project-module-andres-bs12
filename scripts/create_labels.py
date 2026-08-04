import subprocess

repo = 'ec-mentors/project-module-andres-bs12'

labels = [
    {'name': 'status: in-progress', 'color': 'fbca04', 'description': 'Work in progress'},
    {'name': 'status: todo', 'color': 'd4c5f9', 'description': 'Ready for development'},
    {'name': 'status: backlog', 'color': 'c2e0c6', 'description': 'Backlog items'},
    {'name': 'status: done', 'color': '0e8a16', 'description': 'Completed items'},
    {'name': 'type: refactor', 'color': '1d76db', 'description': 'Code refactoring and optimization'},
    {'name': 'type: security', 'color': 'b60205', 'description': 'Security and authorization'},
    {'name': 'type: feature', 'color': '0052cc', 'description': 'New UI or API feature'},
    {'name': 'backend', 'color': '5319e7', 'description': 'Spring Boot / Java'},
    {'name': 'frontend', 'color': 'e99695', 'description': 'Web UI / HTML / CSS / JS'}
]

print('Creating labels...')
for l in labels:
    cmd = ['gh', 'label', 'create', l['name'], '--color', l['color'], '--description', l['description'], '--repo', repo]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f'Created label: {l["name"]}')
    else:
        print(f'Label exists or error ({l["name"]}):', res.stderr.strip())

# Reopen Issue 12 and mark as In Progress
subprocess.run(['gh', 'issue', 'reopen', '12'])

issue_labels = {
    11: ['status: todo', 'type: security', 'backend'],
    12: ['status: in-progress', 'type: refactor', 'backend'],
    14: ['status: todo', 'type: feature', 'frontend'],
    15: ['status: todo', 'type: feature', 'frontend'],
    16: ['status: todo', 'type: feature', 'frontend'],
    17: ['status: todo', 'type: feature', 'frontend'],
    18: ['status: todo', 'type: feature', 'frontend'],
    19: ['status: todo', 'type: feature', 'frontend'],
    20: ['status: todo', 'type: feature', 'frontend'],
    21: ['status: todo', 'type: feature', 'frontend'],
    22: ['status: todo', 'type: feature', 'frontend'],
    23: ['status: todo', 'type: feature', 'frontend'],
    24: ['status: todo', 'type: feature', 'frontend'],
    25: ['status: todo', 'type: feature', 'frontend'],
    26: ['status: todo', 'type: feature', 'frontend'],
    27: ['status: todo', 'type: feature', 'frontend'],
    28: ['status: todo', 'type: feature', 'frontend'],
}

print('Applying labels to issues...')
for issue_num, lbls in issue_labels.items():
    cmd = ['gh', 'issue', 'edit', str(issue_num), '--add-label', ','.join(lbls)]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f'Issue #{issue_num} updated with labels: {lbls}')
    else:
        print(f'Error updating labels for #{issue_num}:', res.stderr.strip())

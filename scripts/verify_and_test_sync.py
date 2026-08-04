#!/usr/bin/env python3
import os
import sys
import json
import base64
import subprocess
import urllib.request
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent / '.env'
if env_path.exists():
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                os.environ[k.strip()] = v.strip()

JIRA_URL = os.environ.get('JIRA_URL', 'https://abspersonal12.atlassian.net')
JIRA_EMAIL = os.environ.get('JIRA_EMAIL', 'abs.personal12@gmail.com')
JIRA_TOKEN = os.environ.get('JIRA_API_TOKEN', '')
JIRA_PROJECT = os.environ.get('JIRA_PROJECT_KEY', 'NT')
GH_REPO = 'ec-mentors/project-module-andres-bs12'

auth_str = f"{JIRA_EMAIL}:{JIRA_TOKEN}"
b64_auth = base64.b64encode(auth_str.encode()).decode()
jira_headers = {'Authorization': f'Basic {b64_auth}', 'Content-Type': 'application/json'}

def jira_req(endpoint, method='GET', payload=None):
    url = f"{JIRA_URL}{endpoint}"
    data = json.dumps(payload).encode('utf-8') if payload else None
    req = urllib.request.Request(url, data=data, headers=jira_headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode()
            return json.loads(content) if content else {}
    except Exception as e:
        print(f"Jira error ({method} {endpoint}):", e)
        return None

print("=== Audit & Setup Active Jira Tasks ===")

# Create or verify Jira task for Definir Sprint 3
res = jira_req('/rest/api/3/search/jql', method='POST', payload={'jql': f'project={JIRA_PROJECT} AND summary ~ "Definir Sprint 3"', 'fields': ['summary', 'status']})
s3_jira_key = None
if res and res.get('issues'):
    s3_jira_key = res['issues'][0]['key']
    print(f"Found existing Jira task for Definir Sprint 3: {s3_jira_key}")
else:
    payload = {
        'fields': {
            'project': {'key': JIRA_PROJECT},
            'summary': 'Definir Sprint 3',
            'description': {'type': 'doc', 'version': 1, 'content': [{'type': 'paragraph', 'content': [{'type': 'text', 'text': 'Definición de componentes y arquitectura Front-End para el Sprint 3.'}]}]},
            'parent': {'key': 'NT-71'},
            'issuetype': {'name': 'Task'}
        }
    }
    new_task = jira_req('/rest/api/3/issue', method='POST', payload=payload)
    if new_task and 'key' in new_task:
        s3_jira_key = new_task['key']
        print(f"Created Jira task {s3_jira_key} for Definir Sprint 3")

# Ensure Jira NT-74 is In Progress (ID 21)
jira_req('/rest/api/3/issue/NT-74/transitions', method='POST', payload={'transition': {'id': '21'}})
print("Updated Jira NT-74 status -> In Progress")

# Ensure Jira NT-73 is To Do (ID 11)
jira_req('/rest/api/3/issue/NT-73/transitions', method='POST', payload={'transition': {'id': '11'}})
print("Updated Jira NT-73 status -> To Do")

# Update GitHub issues to explicitly link Jira keys
subprocess.run(['gh', 'issue', 'edit', '12', '--repo', GH_REPO, '--title', 'Refactor Boilerplate DTOs with Java Records & MapStruct [NT-74]', '--add-label', 'status: in-progress,type: refactor,backend'])
subprocess.run(['gh', 'issue', 'edit', '11', '--repo', GH_REPO, '--title', 'Investigate and Implement User Data Ownership Security (IDOR Protection) [NT-73]', '--add-label', 'status: todo,type: security,backend'])

if s3_jira_key:
    subprocess.run(['gh', 'issue', 'edit', '183', '--repo', GH_REPO, '--title', f'Definir Sprint 3 [{s3_jira_key}]', '--add-label', 'status: todo,type: feature,frontend'])

print("=== Verification & Linkage Complete ===")

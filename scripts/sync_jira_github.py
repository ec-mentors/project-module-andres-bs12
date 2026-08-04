#!/usr/bin/env python3
import os
import sys
import json
import base64
import subprocess
import urllib.request
from pathlib import Path

# Load .env file
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

if not JIRA_TOKEN:
    print("Error: JIRA_API_TOKEN environment variable not set.")
    sys.exit(1)

auth_str = f"{JIRA_EMAIL}:{JIRA_TOKEN}"
b64_auth = base64.b64encode(auth_str.encode()).decode()
jira_headers = {
    'Authorization': f'Basic {b64_auth}',
    'Content-Type': 'application/json'
}

def jira_request(endpoint, method='GET', payload=None):
    url = f"{JIRA_URL}{endpoint}"
    data = json.dumps(payload).encode('utf-8') if payload else None
    req = urllib.request.Request(url, data=data, headers=jira_headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode()
            return json.loads(content) if content else {}
    except Exception as e:
        print(f"Jira API error ({method} {endpoint}): {e}")
        return None

def fetch_target_jira_issues():
    payload = {
        'jql': f'project={JIRA_PROJECT} AND key in (NT-73, NT-74, NT-832)',
        'fields': ['summary', 'status', 'parent', 'description', 'labels'],
        'maxResults': 50
    }
    res = jira_request('/rest/api/3/search/jql', method='POST', payload=payload)
    if not res or 'issues' not in res:
        return []
    return res['issues']

def fetch_target_github_issues():
    # Only target the primary canonical issues for Sprint 2 and Sprint 3
    target_nums = [11, 12, 183]
    issues = []
    for num in target_nums:
        cmd = ['gh', 'issue', 'view', str(num), '--repo', GH_REPO, '--json', 'number,title,state,body,labels,milestone']
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0 and res.stdout.strip():
            issues.append(json.loads(res.stdout))
    return issues

def transition_jira_issue(jira_key, target_status_name):
    tdata = jira_request(f'/rest/api/3/issue/{jira_key}/transitions', method='GET')
    if not tdata or 'transitions' not in tdata:
        return False
    
    target_id = None
    target_lower = target_status_name.lower()
    for t in tdata['transitions']:
        name_lower = t['name'].lower()
        if target_lower in name_lower or (target_lower == 'done' and name_lower in ['done', 'completado', 'cerrado']):
            target_id = t['id']
            break
    
    if target_id:
        res = jira_request(f'/rest/api/3/issue/{jira_key}/transitions', method='POST', payload={'transition': {'id': target_id}})
        print(f"✓ Transitioned Jira {jira_key} -> {target_status_name}")
        return True
    else:
        print(f"Could not find transition ID for Jira {jira_key} to {target_status_name}")
        return False

def sync_jira_and_github():
    print("=== Starting Direct Canonical Jira <-> GitHub Sync ===")
    jira_issues = fetch_target_jira_issues()
    gh_issues = fetch_target_github_issues()
    
    jira_by_key = {issue['key']: issue for issue in jira_issues}
    print(f"Loaded {len(jira_issues)} active Jira issues and {len(gh_issues)} target GitHub issues.")

    for gh_issue in gh_issues:
        gh_num = gh_issue['number']
        gh_title = gh_issue['title'].strip()
        gh_state = gh_issue['state']
        gh_labels = [l['name'] for l in gh_issue.get('labels', [])]
        
        jira_key = None
        for key in jira_by_key:
            if f"[{key}]" in gh_title or (key == 'NT-832' and 'Definir Sprint 3' in gh_title):
                jira_key = key
                break
                
        if not jira_key or jira_key not in jira_by_key:
            continue

        jira_status = jira_by_key[jira_key]['fields']['status']['name'].lower()
        
        # 1. If GitHub issue is CLOSED -> Move Jira task to Done
        if gh_state == 'CLOSED':
            if jira_status not in ['done', 'completado', 'cerrado']:
                transition_jira_issue(jira_key, 'Done')
            if 'status: done' not in gh_labels:
                clean_labels = [l for l in gh_labels if not l.startswith('status:')] + ['status: done']
                subprocess.run(['gh', 'issue', 'edit', str(gh_num), '--repo', GH_REPO, '--add-label', ','.join(clean_labels)])
            continue

        # 2. If Jira is DONE (and GitHub is OPEN) -> Close GitHub Issue
        if jira_status in ['done', 'completado', 'cerrado']:
            subprocess.run(['gh', 'issue', 'close', str(gh_num), '--repo', GH_REPO, '--comment', f'Closed via Jira sync ({jira_key} is Done)'])
            clean_labels = [l for l in gh_labels if not l.startswith('status:')] + ['status: done']
            subprocess.run(['gh', 'issue', 'edit', str(gh_num), '--repo', GH_REPO, '--add-label', ','.join(clean_labels)])
            print(f"✓ Closed GitHub #{gh_num} ({gh_title}) because Jira {jira_key} is Done.")
            continue

        # 3. Both Jira and GitHub are ACTIVE -> Sync States
        new_labels = list(gh_labels)
        label_changed = False

        if jira_status == 'in progress':
            if 'status: in-progress' not in new_labels:
                new_labels = [l for l in new_labels if not l.startswith('status:')] + ['status: in-progress']
                label_changed = True
        elif jira_status in ['to do', 'backlog']:
            if 'status: todo' not in new_labels:
                new_labels = [l for l in new_labels if not l.startswith('status:')] + ['status: todo']
                label_changed = True

        if label_changed:
            subprocess.run(['gh', 'issue', 'edit', str(gh_num), '--repo', GH_REPO, '--add-label', ','.join(new_labels)])

    print("=== Sync Complete! ===")

if __name__ == '__main__':
    sync_jira_and_github()

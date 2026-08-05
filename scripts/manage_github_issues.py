#!/usr/bin/env python3
"""
GitHub Issue & Project Board Management Utility for NutritionTracker.
Automates label creation, issue lifecycle updates, and GitHub project board synchronization.
"""

import subprocess
import json

REPO = 'ec-mentors/project-module-andres-bs12'
PROJECT_OWNER = 'andres-bs12'
PROJECT_ID = '3'

LABELS = [
    {'name': 'status: in-progress', 'color': 'fbca04', 'description': 'Work currently in progress'},
    {'name': 'status: todo', 'color': 'd4c5f9', 'description': 'Ready for development'},
    {'name': 'status: backlog', 'color': 'c2e0c6', 'description': 'Backlog items'},
    {'name': 'status: done', 'color': '0e8a16', 'description': 'Completed tasks'},
    {'name': 'type: refactor', 'color': '1d76db', 'description': 'Code refactoring and optimization'},
    {'name': 'type: security', 'color': 'b60205', 'description': 'Security and authorization'},
    {'name': 'type: feature', 'color': '0052cc', 'description': 'New UI or API feature'},
    {'name': 'backend', 'color': '5319e7', 'description': 'Spring Boot / Java'},
    {'name': 'frontend', 'color': 'e99695', 'description': 'Web UI / HTML / CSS / JS'}
]


def create_labels():
    """Create project labels if they do not already exist."""
    print("=== Synchronizing GitHub Labels ===")
    for label in LABELS:
        cmd = [
            'gh', 'label', 'create', label['name'],
            '--color', label['color'],
            '--description', label['description'],
            '--repo', REPO
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0:
            print(f"Created label: {label['name']}")
        else:
            print(f"Label already exists: {label['name']}")


def sync_project_board(issue_urls):
    """Add specified issue URLs to the GitHub Project Board."""
    print("=== Synchronizing GitHub Project Board ===")
    for url in issue_urls:
        cmd = ['gh', 'project', 'item-add', PROJECT_ID, '--owner', PROJECT_OWNER, '--url', url]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0:
            print(f"Added to Project Board: {url}")


if __name__ == '__main__':
    create_labels()
    print("=== GitHub Management Script Execution Complete ===")

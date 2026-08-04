import subprocess

# Reopen Issue 11 for Security
subprocess.run(['gh', 'issue', 'reopen', '11'])

updates = [
    {
        'num': 11,
        'title': 'Investigate and Implement User Data Ownership Security (IDOR Protection)',
        'milestone': 'Sprint2',
        'body': """## 🎯 Goal
Investigate and implement Spring Security method-level security and ownership validation to ensure users can only access and modify their own personal data.

## 📋 Subtasks & Action Items
- [ ] Research Spring Security `@PreAuthorize` method-level annotations
- [ ] Implement custom security evaluation beans (e.g. `@userSecurity.isOwner(#id, authentication)`)
- [ ] Enforce IDOR protection on User, Goal, and Entry REST endpoints
- [ ] Test unauthorized access attempts to ensure HTTP `403 Forbidden` responses"""
    },
    {
        'num': 12,
        'title': 'Refactor Boilerplate DTOs with Java Records & MapStruct',
        'milestone': 'Sprint2',
        'body': """## 🎯 Goal
Refactor all Request and Response DTOs to Java Records (Java 14+) and automate compile-time mapping using MapStruct.

## 📋 Subtasks & Action Items
- [x] Migrate `UserRequestDTO`, `UserResponseDTO`, `GoalRequestDTO`, `GoalResponseDTO`, `EntryRequestDTO`, `EntryResponseDTO` to Java Records
- [x] Create MapStruct mapper interfaces (`UserMapper`, `GoalMapper`, `EntryMapper`)
- [x] Configure `pom.xml` dependencies for MapStruct and Lombok binding
- [x] Verify compile-time generation of mapping implementations (`GoalMapperImpl`, etc.)
- [x] Test REST endpoints with updated record accessors"""
    },
    {
        'num': 14,
        'title': 'Design System & Global Layout Setup',
        'milestone': 'Sprint3',
        'body': """## 🎯 Goal
Establish the global design system, CSS variables, and page layout grid based on the Figma design system.

## 📋 Subtasks & Action Items
- [ ] Set up global CSS layout structure
- [ ] Define responsive container grids and flexbox utilities
- [ ] Create shared layout wrapper for header, main content, and footer"""
    },
    {
        'num': 15,
        'title': 'Setup Figma Design Tokens CSS (styles.css)',
        'milestone': 'Sprint3',
        'body': """## 🎯 Goal
Define all design tokens from the Figma atomic design system in `styles.css`.

## 📋 Subtasks & Action Items
- [ ] Define `:root` color palette (`#05030d`, `#6417ff`, background & accent colors)
- [ ] Configure Inter typography scale, font weights, and line heights
- [ ] Create reusable glassmorphism card styles and button states (`hover`, `active`, `disabled`)"""
    },
    {
        'num': 16,
        'title': 'Build Shared Navigation Header Component',
        'milestone': 'Sprint3',
        'body': """## 🎯 Goal
Build the shared top navigation header component across all pages.

## 📋 Subtasks & Action Items
- [ ] Create header HTML structure with logo and brand title
- [ ] Add navigation links (`Home`, `Overview`, `Goals`)
- [ ] Add user profile avatar and logout indicator"""
    },
    {
        'num': 17,
        'title': 'Page 1: Home / Daily Dashboard (index.html)',
        'milestone': 'Sprint3',
        'body': """## 🎯 Goal
Build the primary daily dashboard HTML layout (`index.html`).

## 📋 Subtasks & Action Items
- [ ] Assemble daily dashboard page grid
- [ ] Integrate Kcal remaining hero section
- [ ] Add comparison table and latest entries panel layout"""
    },
    {
        'num': 18,
        'title': 'Build Kcal Remaining Hero & 4 Macro KPI Cards',
        'milestone': 'Sprint3',
        'body': """## 🎯 Goal
Create the interactive progress hero and macro summary cards.

## 📋 Subtasks & Action Items
- [ ] Build circular progress bar / hero for remaining calories
- [ ] Build KPI cards for Protein, Carbs, Fats, and Water intake
- [ ] Add progress indicators and percentage completion bars"""
    },
    {
        'num': 19,
        'title': 'Build Goal vs Actual Comparison Table',
        'milestone': 'Sprint3',
        'body': """## 🎯 Goal
Construct the data comparison table contrasting target goals vs logged intake.

## 📋 Subtasks & Action Items
- [ ] Create HTML table for macro goals vs actual values
- [ ] Style delta badges (surplus / deficit indicators)
- [ ] Add daily progress summary rows"""
    },
    {
        'num': 20,
        'title': 'Build Latest Entries Side Panel',
        'milestone': 'Sprint3',
        'body': """## 🎯 Goal
Build the sidebar component listing recently logged meal entries.

## 📋 Subtasks & Action Items
- [ ] Create entry list item template (meal name, timestamp, calories)
- [ ] Add entry delete and edit action buttons
- [ ] Style scrollable side panel container"""
    },
    {
        'num': 21,
        'title': 'Connect Home Page JS to REST API (app.js)',
        'milestone': 'Sprint3',
        'body': """## 🎯 Goal
Connect `index.html` frontend components to backend REST API endpoints.

## 📋 Subtasks & Action Items
- [ ] Fetch daily entries from `GET /api/entry`
- [ ] Fetch user target goal from `GET /api/goal`
- [ ] Update Kcal hero and macro cards dynamically via DOM manipulation
- [ ] Implement new meal entry submission handler (`POST /api/entry`)"""
    },
    {
        'num': 22,
        'title': 'Page 2: Overview / Analytics Dashboard (overview.html)',
        'milestone': 'Sprint3',
        'body': """## 🎯 Goal
Construct the analytics view HTML layout (`overview.html`).

## 📋 Subtasks & Action Items
- [ ] Assemble analytics page container
- [ ] Add monthly summary metrics row
- [ ] Create chart containers for macro breakdown and calorie trend"""
    },
    {
        'num': 23,
        'title': 'Build Monthly Balance KPI Row Cards',
        'milestone': 'Sprint3',
        'body': """## 🎯 Goal
Build summary KPI cards for monthly calorie balance and averages.

## 📋 Subtasks & Action Items
- [ ] Create total monthly intake KPI card
- [ ] Create daily average calorie card
- [ ] Create logging streak counter card"""
    },
    {
        'num': 24,
        'title': 'Build Charts Container (Macro Distribution & Trend)',
        'milestone': 'Sprint3',
        'body': """## 🎯 Goal
Integrate JavaScript data visualization charts.

## 📋 Subtasks & Action Items
- [ ] Integrate Chart.js / Canvas library
- [ ] Build macro distribution pie chart
- [ ] Build 30-day calorie trend line chart"""
    },
    {
        'num': 25,
        'title': 'Connect Overview JS to Analytics REST Data (overview.js)',
        'milestone': 'Sprint3',
        'body': """## 🎯 Goal
Fetch and render historical analytics data on `overview.html`.

## 📋 Subtasks & Action Items
- [ ] Fetch historical entries from backend analytics endpoint
- [ ] Populate monthly KPI values dynamically
- [ ] Pass time-series data to Chart.js renderers"""
    },
    {
        'num': 26,
        'title': 'Page 3: Set Goal Management (goal.html)',
        'milestone': 'Sprint3',
        'body': """## 🎯 Goal
Construct the goal setting page HTML layout (`goal.html`).

## 📋 Subtasks & Action Items
- [ ] Create goal management page layout
- [ ] Integrate goal settings form panel
- [ ] Add target summary preview card"""
    },
    {
        'num': 27,
        'title': 'Build Goal Settings Panel Form',
        'milestone': 'Sprint3',
        'body': """## 🎯 Goal
Build the form interface for updating daily nutritional goals.

## 📋 Subtasks & Action Items
- [ ] Create form inputs for Daily Calories (kcal), Protein (g), Carbs (g), and Fat (g)
- [ ] Add input validation and min/max boundaries
- [ ] Add save and reset action buttons"""
    },
    {
        'num': 28,
        'title': 'Connect Goal Form to REST API (goal.js)',
        'milestone': 'Sprint3',
        'body': """## 🎯 Goal
Connect the goal settings form to the backend REST API.

## 📋 Subtasks & Action Items
- [ ] Fetch current user goal (`GET /api/goal`) to pre-fill form fields
- [ ] Handle form submission (`POST /api/goal` / `PUT /api/goal`)
- [ ] Show success/error notification banners upon saving"""
    }
]

print('Updating issue titles, milestones, and action items...')
for item in updates:
    cmd = [
        'gh', 'issue', 'edit', str(item['num']),
        '--title', item['title'],
        '--milestone', item['milestone'],
        '--body', item['body']
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f'Updated Issue #{item["num"]}: {item["title"]} -> {item["milestone"]}')
    else:
        print(f'Error updating Issue #{item["num"]}:', res.stderr)

-- CI smoke-test user (idempotent)
INSERT INTO users (id, google_id, first_name, last_name, email, role)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'ci-google-id',
  'CI',
  'Tester',
  'ci.tester@nutritiontracker.local',
  'USER'
)
ON CONFLICT (id) DO NOTHING;

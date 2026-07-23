-- Seed data for MindBridge MVP
-- Password for all users: "password123" (bcrypt hash)
-- $2b$10$rQZQZ8qj8K9Zg0XZKqZQZuQZQZ8qj8K9Zg0XZKqZQZuQZQZ8qj8K

-- Clear existing data
DELETE FROM alerts;
DELETE FROM messages;
DELETE FROM journal_entries;
DELETE FROM sessions;
DELETE FROM patients;
DELETE FROM users;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE patients_id_seq RESTART WITH 1;
ALTER SEQUENCE journal_entries_id_seq RESTART WITH 1;
ALTER SEQUENCE messages_id_seq RESTART WITH 1;
ALTER SEQUENCE alerts_id_seq RESTART WITH 1;

-- Insert users (password: password123)
INSERT INTO users (id, role, name, email, password_hash) VALUES
(1, 'practitioner', 'Dr. Sarah Chen', 'dr.chen@mindbridge.com', '$2b$10$KIXQK5VqKbSBk5Wq5z5z5uL5z5z5z5z5z5z5z5z5z5z5z5z5z5z5z'),
(2, 'patient', 'Alex Rivera', 'alex@example.com', '$2b$10$KIXQK5VqKbSBk5Wq5z5z5uL5z5z5z5z5z5z5z5z5z5z5z5z5z5z5z'),
(3, 'patient', 'Jordan Kim', 'jordan@example.com', '$2b$10$KIXQK5VqKbSBk5Wq5z5z5uL5z5z5z5z5z5z5z5z5z5z5z5z5z5z5z'),
(4, 'patient', 'Morgan Taylor', 'morgan@example.com', '$2b$10$KIXQK5VqKbSBk5Wq5z5z5uL5z5z5z5z5z5z5z5z5z5z5z5z5z5z5z');

-- Link patients to practitioner
INSERT INTO patients (user_id, practitioner_id) VALUES
(2, 1),
(3, 1),
(4, 1);

-- Journal entries for Alex Rivera (user_id 2) - 14 days of data
INSERT INTO journal_entries (patient_id, mood, anxiety, sleep_hours, medication_taken, side_effects, side_effects_other, challenges, achievements, created_at) VALUES
(2, 7, 3, 7.5, true, ARRAY[]::TEXT[], NULL, 'Felt slightly overwhelmed at work', 'Completed morning meditation', NOW() - INTERVAL '13 days'),
(2, 6, 4, 6.0, true, ARRAY['headache'], NULL, 'Difficulty concentrating', 'Went for a 30-minute walk', NOW() - INTERVAL '12 days'),
(2, 8, 2, 8.0, true, ARRAY[]::TEXT[], NULL, 'None significant', 'Had a great therapy session', NOW() - INTERVAL '11 days'),
(2, 5, 5, 5.5, true, ARRAY['other'], 'Drowsiness', 'Argument with a friend', 'Journaled about feelings', NOW() - INTERVAL '10 days'),
(2, 7, 3, 7.0, true, ARRAY[]::TEXT[], NULL, 'Work deadline stress', 'Practiced deep breathing', NOW() - INTERVAL '9 days'),
(2, 6, 4, 6.5, true, ARRAY[]::TEXT[], NULL, 'Social anxiety at gathering', 'Attended social event despite anxiety', NOW() - INTERVAL '8 days'),
(2, 8, 2, 8.5, true, ARRAY[]::TEXT[], NULL, 'Minor sleep disruption', 'Finished reading a book', NOW() - INTERVAL '7 days'),
(2, 7, 3, 7.0, true, ARRAY[]::TEXT[], NULL, 'Fatigue in afternoon', 'Maintained exercise routine', NOW() - INTERVAL '6 days'),
(2, 4, 6, 4.5, false, ARRAY[]::TEXT[], NULL, 'Missed medication, felt anxious', 'Recognized need to refill prescription', NOW() - INTERVAL '5 days'),
(2, 3, 7, 4.0, false, ARRAY[]::TEXT[], NULL, 'Continued anxiety from yesterday', 'Called doctor for refill', NOW() - INTERVAL '4 days'),
(2, 5, 5, 6.0, true, ARRAY['nausea'], NULL, 'Readjusting to medication', 'Back on medication schedule', NOW() - INTERVAL '3 days'),
(2, 6, 4, 7.0, true, ARRAY[]::TEXT[], NULL, 'Mild fatigue', 'Cooked a healthy meal', NOW() - INTERVAL '2 days'),
(2, 7, 3, 7.5, true, ARRAY[]::TEXT[], NULL, 'Slight work pressure', 'Morning yoga session', NOW() - INTERVAL '1 day'),
(2, 7, 3, 7.0, true, ARRAY[]::TEXT[], NULL, 'Nothing major', 'Productive work day', NOW());

-- Journal entries for Jordan Kim (user_id 3) - showing declining pattern
INSERT INTO journal_entries (patient_id, mood, anxiety, sleep_hours, medication_taken, side_effects, side_effects_other, challenges, achievements, created_at) VALUES
(3, 7, 3, 7.0, true, ARRAY[]::TEXT[], NULL, 'Minor stress', 'Good day overall', NOW() - INTERVAL '13 days'),
(3, 6, 4, 6.5, true, ARRAY[]::TEXT[], NULL, 'Work issues', 'Completed project milestone', NOW() - INTERVAL '12 days'),
(3, 6, 4, 6.0, true, ARRAY[]::TEXT[], NULL, 'Sleep was restless', 'Went to gym', NOW() - INTERVAL '11 days'),
(3, 5, 5, 5.5, true, ARRAY['headache'], NULL, 'Feeling isolated', 'Called a friend', NOW() - INTERVAL '10 days'),
(3, 4, 6, 5.0, true, ARRAY[]::TEXT[], NULL, 'Low motivation', 'Got out of bed on time', NOW() - INTERVAL '9 days'),
(3, 4, 6, 4.5, true, ARRAY[]::TEXT[], NULL, 'Withdrew from social plans', 'Ate three meals', NOW() - INTERVAL '8 days'),
(3, 3, 7, 4.0, true, ARRAY[]::TEXT[], NULL, 'Persistent sadness', 'Reached out to therapist', NOW() - INTERVAL '7 days'),
(3, 3, 7, 3.5, false, ARRAY[]::TEXT[], NULL, 'Could not sleep well', 'Tried new coping technique', NOW() - INTERVAL '6 days'),
(3, 2, 8, 3.0, false, ARRAY[]::TEXT[], NULL, 'Overwhelming anxiety', 'Still showing up', NOW() - INTERVAL '5 days'),
(3, 2, 8, 3.5, false, ARRAY[]::TEXT[], NULL, 'Missed work', 'Took a shower', NOW() - INTERVAL '4 days'),
(3, 3, 7, 4.0, true, ARRAY[]::TEXT[], NULL, 'Difficulty functioning', 'Went outside briefly', NOW() - INTERVAL '3 days'),
(3, 2, 8, 3.0, true, ARRAY['nausea'], NULL, 'Everything feels hard', 'Ate something', NOW() - INTERVAL '2 days'),
(3, 2, 9, 2.5, true, ARRAY[]::TEXT[], NULL, 'Very low mood', 'Messaged doctor', NOW() - INTERVAL '1 day'),
(3, 2, 9, 2.0, true, ARRAY[]::TEXT[], NULL, 'Crisis feeling', 'Asked for help', NOW());

-- Journal entries for Morgan Taylor (user_id 4) - stable pattern
INSERT INTO journal_entries (patient_id, mood, anxiety, sleep_hours, medication_taken, side_effects, side_effects_other, challenges, achievements, created_at) VALUES
(4, 6, 4, 7.0, true, ARRAY[]::TEXT[], NULL, 'Normal day', 'Went to work', NOW() - INTERVAL '13 days'),
(4, 7, 3, 7.5, true, ARRAY[]::TEXT[], NULL, 'Minor frustration', 'Good workout', NOW() - INTERVAL '12 days'),
(4, 6, 4, 7.0, true, ARRAY[]::TEXT[], NULL, 'Slight tiredness', 'Met a friend for coffee', NOW() - INTERVAL '11 days'),
(4, 7, 3, 8.0, true, ARRAY[]::TEXT[], NULL, 'Nothing notable', 'Productive day', NOW() - INTERVAL '10 days'),
(4, 6, 3, 7.5, true, ARRAY[]::TEXT[], NULL, 'Traffic stress', 'Relaxed evening', NOW() - INTERVAL '9 days'),
(4, 7, 3, 7.0, true, ARRAY[]::TEXT[], NULL, 'Brief anxiety', 'Handled it well', NOW() - INTERVAL '8 days'),
(4, 7, 2, 8.0, true, ARRAY[]::TEXT[], NULL, 'Weekend relaxation', 'Family time', NOW() - INTERVAL '7 days'),
(4, 6, 4, 7.0, true, ARRAY[]::TEXT[], NULL, 'Monday blues', 'Exercise routine', NOW() - INTERVAL '6 days'),
(4, 7, 3, 7.5, true, ARRAY[]::TEXT[], NULL, 'Work meeting stress', 'Presentation went well', NOW() - INTERVAL '5 days'),
(4, 6, 3, 7.0, true, ARRAY[]::TEXT[], NULL, 'Slight fatigue', 'Healthy eating day', NOW() - INTERVAL '4 days'),
(4, 7, 3, 8.0, true, ARRAY[]::TEXT[], NULL, 'Good day', 'Journaling habit maintained', NOW() - INTERVAL '3 days'),
(4, 7, 2, 7.5, true, ARRAY[]::TEXT[], NULL, 'All good', 'Nature walk', NOW() - INTERVAL '2 days'),
(4, 6, 3, 7.0, true, ARRAY['headache'], NULL, 'Rest and recovery', NOW() - INTERVAL '1 day'),
(4, 7, 3, 7.5, true, ARRAY[]::TEXT[], NULL, 'Nothing to report', 'Consistent routine', NOW());

-- Messages between Dr. Chen and Alex
INSERT INTO messages (sender_id, receiver_id, text, read, created_at) VALUES
(1, 2, 'Hi Alex, I noticed your mood dipped last week. How are you feeling now that you are back on your medication?', true, NOW() - INTERVAL '3 days'),
(2, 1, 'Hi Dr. Chen, yes I missed a couple of days but I am back on track now. The nausea was rough at first but it is better.', true, NOW() - INTERVAL '3 days' + INTERVAL '2 hours'),
(1, 2, 'Good to hear. Remember to set a daily reminder on your phone. Let me know if the nausea persists and we can discuss alternatives.', true, NOW() - INTERVAL '3 days' + INTERVAL '4 hours'),
(2, 1, 'Will do, thank you! I have been keeping up with the breathing exercises too.', true, NOW() - INTERVAL '2 days'),
(1, 2, 'Excellent work Alex. Your consistency with the exercises is really showing in your journal entries.', false, NOW() - INTERVAL '1 day');

-- Messages between Dr. Chen and Jordan
INSERT INTO messages (sender_id, receiver_id, text, read, created_at) VALUES
(1, 3, 'Jordan, I am concerned about the trend I am seeing in your journal. Can we schedule an earlier appointment this week?', true, NOW() - INTERVAL '2 days'),
(3, 1, 'Yes please. I have been struggling a lot. Everything feels really overwhelming right now.', true, NOW() - INTERVAL '2 days' + INTERVAL '1 hour'),
(1, 3, 'I understand, and I am glad you are being honest about how you feel. I have an opening tomorrow at 2pm. Does that work?', true, NOW() - INTERVAL '2 days' + INTERVAL '2 hours'),
(3, 1, 'That works. Thank you for checking in on me Dr. Chen.', true, NOW() - INTERVAL '1 day'),
(1, 3, 'Of course. Remember, if you ever feel in crisis, you can call 988 anytime. You are not alone in this.', false, NOW() - INTERVAL '12 hours');

-- Alerts
INSERT INTO alerts (patient_id, alert_type, description, status, created_at) VALUES
(3, 'mood_drop', 'Mood dropped below 3 for 3 consecutive days', 'open', NOW() - INTERVAL '3 days'),
(3, 'sleep_critical', 'Sleep consistently below 4 hours for 5 days', 'open', NOW() - INTERVAL '2 days'),
(3, 'medication_missed', 'Missed medication 2 days in a row', 'resolved', NOW() - INTERVAL '6 days'),
(2, 'medication_missed', 'Missed medication 2 days in a row', 'resolved', NOW() - INTERVAL '4 days'),
(3, 'anxiety_spike', 'Anxiety level at 9 - critical threshold', 'open', NOW() - INTERVAL '1 day');

-- Update sequences to avoid conflicts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('patients_id_seq', (SELECT MAX(id) FROM patients));
SELECT setval('journal_entries_id_seq', (SELECT MAX(id) FROM journal_entries));
SELECT setval('messages_id_seq', (SELECT MAX(id) FROM messages));
SELECT setval('alerts_id_seq', (SELECT MAX(id) FROM alerts));

-- Apply before deploying the API and frontend that submit feedback V2.
-- Existing feedback and V1 submissions keep a NULL comment.
ALTER TABLE hub.feedback
    ADD COLUMN IF NOT EXISTS comment Nullable(String);

-- Rollback: deploy the previous API/frontend and retain this additive column
-- so that any V2 comments already collected remain available.

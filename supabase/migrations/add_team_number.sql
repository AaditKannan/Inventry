-- Add team_number column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_number TEXT;

-- Add index for team_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_teams_team_number ON teams(team_number);

-- Add comment
COMMENT ON COLUMN teams.team_number IS 'FTC team number for official team identification';

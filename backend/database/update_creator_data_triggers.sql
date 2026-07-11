-- =========================================================================
-- Triggers for PROMPTS table (Updates posted_prompt_count)
-- =========================================================================

-- 1. When a new prompt is INSERTED
CREATE TRIGGER after_prompt_insert
AFTER INSERT ON prompts
FOR EACH ROW
BEGIN
    UPDATE creator_data 
    SET posted_prompt_count = (
        SELECT COUNT(*) FROM prompts 
        WHERE creator_id = NEW.creator_id 
        AND permission != 'Draft' 
        AND (is_banned IS NULL OR is_banned = 0)
    )
    WHERE user_id = NEW.creator_id;
END;
//

-- 2. When a prompt is UPDATED (e.g. changed to draft or banned)
CREATE TRIGGER after_prompt_update
AFTER UPDATE ON prompts
FOR EACH ROW
BEGIN
    -- Update for the new creator_id
    UPDATE creator_data 
    SET posted_prompt_count = (
        SELECT COUNT(*) FROM prompts 
        WHERE creator_id = NEW.creator_id 
        AND permission != 'Draft' 
        AND (is_banned IS NULL OR is_banned = 0)
    )
    WHERE user_id = NEW.creator_id;
    
    -- If creator_id changed (rare, but good practice), update the old one too
    IF OLD.creator_id != NEW.creator_id THEN
        UPDATE creator_data 
        SET posted_prompt_count = (
            SELECT COUNT(*) FROM prompts 
            WHERE creator_id = OLD.creator_id 
            AND permission != 'Draft' 
            AND (is_banned IS NULL OR is_banned = 0)
        )
        WHERE user_id = OLD.creator_id;
    END IF;
END;
//

-- 3. When a prompt is DELETED
CREATE TRIGGER after_prompt_delete
AFTER DELETE ON prompts
FOR EACH ROW
BEGIN
    UPDATE creator_data 
    SET posted_prompt_count = (
        SELECT COUNT(*) FROM prompts 
        WHERE creator_id = OLD.creator_id 
        AND permission != 'Draft' 
        AND (is_banned IS NULL OR is_banned = 0)
    )
    WHERE user_id = OLD.creator_id;
END;
//


-- =========================================================================
-- Triggers for FOLLOWERS table (Updates following_count & followers_count)
-- =========================================================================

-- 4. When a user FOLLOWS someone (INSERT)
CREATE TRIGGER after_follower_insert
AFTER INSERT ON followers
FOR EACH ROW
BEGIN
    -- Update following_count for the user who clicked "Follow"
    UPDATE creator_data 
    SET following_count = (SELECT COUNT(*) FROM followers WHERE follower_id = NEW.follower_id)
    WHERE user_id = NEW.follower_id;
    
    -- Update followers_count for the creator who just got a new follower
    UPDATE creator_data 
    SET followers_count = (SELECT COUNT(*) FROM followers WHERE creator_id = NEW.creator_id)
    WHERE user_id = NEW.creator_id;
END;
//

-- 5. When a user UNFOLLOWS someone (DELETE)
CREATE TRIGGER after_follower_delete
AFTER DELETE ON followers
FOR EACH ROW
BEGIN
    -- Update following_count for the user who clicked "Unfollow"
    UPDATE creator_data 
    SET following_count = (SELECT COUNT(*) FROM followers WHERE follower_id = OLD.follower_id)
    WHERE user_id = OLD.follower_id;
    
    -- Update followers_count for the creator who lost a follower
    UPDATE creator_data 
    SET followers_count = (SELECT COUNT(*) FROM followers WHERE creator_id = OLD.creator_id)
    WHERE user_id = OLD.creator_id;
END;
//

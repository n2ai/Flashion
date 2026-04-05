const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

router.post('/', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Get email of user by userId
        const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(userId);

        if (getUserError || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 2. Verify current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });

        if (signInError) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // 3. Update password
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password: newPassword,
        });

        if (updateError) {
            console.error('Supabase Update Password Error', updateError);
            return res.status(500).json({ error: 'Failed to update password' });
        }

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change Password Error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
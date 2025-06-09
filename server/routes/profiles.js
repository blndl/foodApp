const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateJWT = require('../middleware/authenticateJWT');

router.post('/newProfile', authenticateJWT, async (req, res) => {
  const {
    userId, profileName, age, gender, height, weight,
    activityLevel, objective, diet
  } = req.body;

  try {
    await db.none(
      `INSERT INTO profiles ("userId", "profileName", age, gender, height, weight, "activityLevel", objective, diet)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId, profileName, age, gender, height, weight, activityLevel, objective, diet]
    );
    res.status(201).json({ message: 'Profile created successfully' });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/get/profile/:profileId', authenticateJWT, async (req, res) => {
  const profileId = req.params.profileId;

  try {
    const profile = await db.oneOrNone('SELECT * FROM profiles WHERE id = $1', [profileId]);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/get/profiles/:userId', authenticateJWT, async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [userId]);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const profiles = await db.any('SELECT * FROM profiles WHERE "userId" = $1', [userId]);
    res.json({ email: user.email, profiles });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/update/profile/:profileId', authenticateJWT, async (req, res) => {
  const { profileId } = req.params;
  const userId = req.user.id;
  const { profileName, age, gender, height, weight, activityLevel, objective, diet } = req.body;

  try {
    const profile = await db.oneOrNone(
      'SELECT * FROM profiles WHERE id = $1 AND "userId" = $2',
      [profileId, userId]
    );
    if (!profile) return res.status(404).json({ message: 'Profile not found or unauthorized' });

    await db.none(
      `UPDATE profiles SET 
        "profileName" = $1, age = $2, gender = $3, height = $4, weight = $5, 
        "activityLevel" = $6, objective = $7, diet = $8
        WHERE id = $9`,
      [profileName, age, gender, height, weight, activityLevel, objective, diet, profileId]
    );

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/delete/profile/:profileId', authenticateJWT, async (req, res) => {
  const profileId = req.params.profileId;
  const userId = req.user.id;

  try {
    const profile = await db.oneOrNone('SELECT * FROM profiles WHERE id = $1', [profileId]);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (profile.userId !== userId)
      return res.status(403).json({ message: 'Unauthorized' });

    await db.none('DELETE FROM profiles WHERE id = $1', [profileId]);
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

console.log('✅ Inside profiles.js before export');
console.log('🧪 typeof router:', typeof router);
console.log('🧪 router keys:', Object.keys(router));
module.exports = router;
console.log('✅ Exported router from profiles.js');
module.exports = router;

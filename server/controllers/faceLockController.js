const User = require('../models/User');

// Example gestures list
const gestureList = [
  'smile',
  'blink_twice',
  'look_left',
  'look_right',
  'raise_eyebrows'
];

// Controller: Update Face Lock
exports.updateFaceLock = async (req, res) => {
  try {
    const userId = req.user.id; // From protect middleware
    const { facelockEmbedding } = req.body;

    if (!facelockEmbedding || !Array.isArray(facelockEmbedding)) {
      return res.status(400).json({ message: 'Invalid face embedding data' });
    }

    // Assign random gesture
    const randomGesture = gestureList[Math.floor(Math.random() * gestureList.length)];

    // Update user record
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        facelock: facelockEmbedding,
        facelockGesture: randomGesture,
        facelockUpdatedAt: new Date(),
        facelockFailedAttempts: 0
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Face lock updated successfully',
      assignedGesture: randomGesture
    });
  } catch (error) {
    console.error('Error updating face lock:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

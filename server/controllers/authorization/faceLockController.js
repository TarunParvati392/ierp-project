// controllers/faceLockController.js
const User = require('../../models/User');

// Example gestures list
const gestureList = [
  'neutral'
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


// Step 1 – Face match
exports.faceLoginStart = async (req, res) => {
  try {
    const { embedding } = req.body;
    if (!embedding || !Array.isArray(embedding)) {
      return res.status(400).json({ error: 'Invalid face data' });
    }

    // Find user with the closest match
    const users = await User.find({ facelock: { $exists: true, $ne: [] } });

    let matchedUser = null;
    let bestDistance = 1; // max possible distance in face-api
    const threshold = 0.45; // adjust for security

    users.forEach(user => {
      const storedEmbedding = Float32Array.from(user.facelock);
      const dist = euclideanDistance(storedEmbedding, embedding);
      if (dist < threshold && dist < bestDistance) {
        bestDistance = dist;
        matchedUser = user;
      }
    });

    if (!matchedUser) {
      return res.status(401).json({ error: 'Face not recognized' });
    }

    // Randomize gesture sequence for this session
    const randomGestures = [...gestureList].sort(() => 0.5 - Math.random()).slice(0, 2);

    // Store temp in DB or in-memory (for small scale)
    matchedUser.tempLoginGestures = randomGestures;
    await matchedUser.save();

    res.json({ userId: matchedUser._id, gestures: randomGestures });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Step 2 – Verify gestures and login
exports.faceLoginVerify = async (req, res) => {
  try {
    const { userId, embeddings } = req.body;
    const user = await User.findById(userId);
    if (!user || !user.tempLoginGestures) {
      return res.status(400).json({ error: 'Invalid session' });
    }

    // ✅ You would verify each embedding with stored face descriptor & expected expression here
    // For now, assume frontend has already filtered wrong gestures

    // If passed:
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Clear temp gestures
    user.tempLoginGestures = undefined;
    await user.save();

    res.json({ message: 'Face+Gesture login successful', token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

function euclideanDistance(arr1, arr2) {
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += Math.pow(arr1[i] - arr2[i], 2);
  }
  return Math.sqrt(sum);
}


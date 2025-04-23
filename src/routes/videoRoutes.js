const express = require('express');
const videoRouter = express.Router();
const Video = require('../models/Video');
const { userAuth } = require('../middlewares/auth');

// POST /videos/upload
videoRouter.post('/upload', userAuth, async (req, res) => {
  const { title, description, youtubeUrl } = req.body;

  // Validate inputs
  if (!title || !youtubeUrl) {
    return res.status(400).json({ message: 'Title and YouTube URL are required' });
  }

  try {
    const embedUrl = youtubeUrl.replace("watch?v=", "embed/"); // Convert URL to embed format

    // Create new video document
    const newVideo = new Video({
      title,
      description,
      youtubeUrl: embedUrl,
      userId: req.user._id,  // User ID
      userName: req.user.firstName + " " + req.user.lastName,  // Add user's full name
    });

    // Save video
    await newVideo.save();
    res.status(201).json({ message: 'Video uploaded successfully', video: newVideo });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload video', error: err.message });
  }
});

// GET /videos
videoRouter.get('/', async (req, res) => {
  try {
    // Fetch all videos and include userName with populated userId
    const videos = await Video.find().sort({ createdAt: -1 }).populate('userId', 'firstName lastName');
    // Since we added userName in the video schema, we don't need to populate userName in the query
    res.json({ videos });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch videos', error: err.message });
  }
});

module.exports = videoRouter;

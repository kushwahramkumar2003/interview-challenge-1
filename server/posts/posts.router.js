const express = require('express');
const axios = require('axios');
const { fetchPosts } = require('./posts.service');
const { fetchUserById } = require('../users/users.service');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const params = req.query || {};
    const posts = await fetchPosts(params);

    const postsWithImagesAndUsers = await Promise.all(
      posts.map(async post => {
        try {
          const { data } = await axios.get(
            `https://jsonplaceholder.typicode.com/albums/${post.id}/photos`,
          );

          const user = await fetchUserById(post.userId);
          const userName = user ? user.shortName : 'Unknown';
          const userEmail = user ? user.email : 'Unknown';

          return {
            ...post,
            images: data.map(photo => ({ url: photo.url })),
            userName,
            userEmail,
          };
        } catch (error) {
          console.error(
            `Error fetching photos or user for post ${post.id}:`,
            error,
          );
          return {
            ...post,
            images: [],
            userName: 'Unknown',
            userEmail: 'Unknown',
          };
        }
      }),
    );

    res.json(postsWithImagesAndUsers);
  } catch (error) {
    console.error('Error fetching posts or photos:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;

import Post from "../models/CommunityPostModel.js";

export const createPost = async (req, res) => {
  try {
    const { caption, imageUrl } = req.body;

    const newPost = await Post.create({
      user: req.user._id,
      caption,
      imageUrl
    });

    res.json({ success: true, post: newPost });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name email")       // show user who posted it
      .populate("comments.user", "name")    // show commenter names
      .sort({ createdAt: -1 });             // latest posts first

    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const userId = req.user._id;

    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ success: true, likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment cannot be empty" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    post.comments.push({ user: req.user._id, text });
    await post.save();

    res.json({ success: true, comments: post.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

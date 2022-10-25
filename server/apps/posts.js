import { Router } from "express";
import { pool } from "../utils/db.js";

const postRouter = Router();

postRouter.get("/", async (req, res) => {
  const keywords = req.query.keywords || "";
  const page = req.query.page || 1;
  const category = req.query.category || "";

  const PAGE_SIZE = 50;
  const offset = (page - 1) * PAGE_SIZE;

  let query = "";
  let values = [];
  console.log("category: ", category);
  if (category && keywords) {
    query = `select *
    from posts
    inner join categories
    on posts.category_id=categories.category_id
    where categories.name ilike $1
    and title ilike $2
    limit $3
    offset $4`;
    values = [category, keywords, PAGE_SIZE, offset];
  } else if (keywords) {
    query = `select *
    from posts
    inner join categories
    on posts.category_id=categories.category_id
    where title ilike $1
    limit $2
    offset $3`;
    values = [keywords, PAGE_SIZE, offset];
  } else if (category) {
    query = `select *
    from posts
    inner join categories
    on posts.category_id=categories.category_id
    where categories.name ilike $1
    limit $2
    offset $3`;
    values = [category, PAGE_SIZE, offset];
  } else {
    query = `select *
    from posts
    inner join categories
    on posts.category_id=categories.category_id
    where
    limit $1
    offset $2
    `;
    values = [PAGE_SIZE, offset];
  }

  const results = await pool.query(query, values);

  return res.json({
    data: results.rows,
  });
});

postRouter.get("/:postId", async (req, res) => {
  const postId = req.params.postId;
  const results = await pool.query("select * from posts where post_id=$1", [
    postId,
  ]);

  return res.json({
    data: results.rows,
  });
});

postRouter.post("/", async (req, res) => {
  const newPost = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
  };
  await pool.query(
    `insert into posts(post_id, user_id, category_id, post_vote_id, title, content, created_at, updated_at) values($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      51,
      newPost.user_id,
      newPost.category_id,
      newPost.post_vote_id,
      newPost.title,
      newPost.content,
      newPost.created_at,
      newPost.updated_at,
    ]
  );
  return res.json({
    message: "Post has been created.",
  });
});

postRouter.post("/:postId/comments", async (req, res) => {
  const newPost = {
    ...req.body,
    created_at: new Date(),
  };
  await pool.query(
    `insert into comments(comment_id, user_id, post_id, comment_vote_id, content, created_at) values($1,$2,$3,$4,$5,$6)`,
    [
      51,
      newPost.user_id,
      newPost.category_id,
      newPost.comment_vote_id,
      newPost.content,
      newPost.created_at,
    ]
  );
  return res.json({
    message: "Comment has been created.",
  });
});

postRouter.put("/:postId", async (req, res) => {
  const updatedPost = {
    ...req.body,
    updated_at: new Date(),
  };
  const postId = req.params.postId;

  await pool.query(
    `update posts set user_id=$1, category_id=$2, post_vote_id=$3, title=$4, content=$5, updated_at=$6 where post_id=$7`,
    [
      updatedPost.user_id,
      updatedPost.category_id,
      updatedPost.post_vote_id,
      updatedPost.title,
      updatedPost.content,
      updatedPost.updated_at,
      postId,
    ]
  );

  return res.json({
    message: `Post ${postId} has been updated.`,
  });
});

postRouter.delete("/:postId", async (req, res) => {
  const postId = req.params.postId;
  await pool.query(`delete from posts where post_id=$1`, [postId]);
  return res.json({
    message: `Post ${postId} has been deleted.`,
  });
});

export default postRouter;

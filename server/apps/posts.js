import { Router } from "express";
import { pool } from "../utils/db.js";

const postRouter = Router();

postRouter.get("/", async (req, res) => {
  const status = req.query.status || "";
  const keywords = req.query.keywords || "";
  const page = req.query.page || 1;

  const PAGE_SIZE = 50;
  const offset = (page - 1) * PAGE_SIZE;

  let query = "";
  let values = [];

  if (status && keywords) {
    query = `select * from posts
    where status=$1
    and title ilike $2
    limit $3
    offset $4`;
    values = [status, keywords, PAGE_SIZE, offset];
  } else if (keywords) {
    query = `select * from posts
    where title ilike $1
    limit $2
    offset $3`;
    values = [keywords, PAGE_SIZE, offset];
  } else if (status) {
    query = `select * from posts
    where status=$1
    limit $2
    offset $3`;
    values = [status, PAGE_SIZE, offset];
  } else {
    query = `select * from posts
    limit $1
    offset $2`;
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
  const hasPublished = req.body.status === "published";
  const newPost = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: hasPublished ? new Date() : null,
  };
  await pool.query(
    `insert into posts(post_id, user_id, category_id, post_vote_id, title, content, created_at, updated_at, published_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      51,
      newPost.user_id,
      newPost.category_id,
      newPost.post_vote_id,
      newPost.title,
      newPost.content,
      newPost.created_at,
      newPost.updated_at,
      newPost.published_at,
    ]
  );
  return res.json({
    message: "Post has been created.",
  });
});

postRouter.put("/:postId", async (req, res) => {
  const hasPublished = req.body.status === "published";

  const updatedPost = {
    ...req.body,
    updated_at: new Date(),
    published_at: hasPublished ? new Date() : null,
  };
  const postId = req.params.postId;

  await pool.query(
    `update posts set user_id=$1, category_id=$2, post_vote_id=$3, title=$4, content=$5, updated_at=$6,published_at=$7 where post_id=$8`,
    [
      updatedPost.user_id,
      updatedPost.category_id,
      updatedPost.post_vote_id,
      updatedPost.title,
      updatedPost.content,
      updatedPost.updated_at,
      updatedPost.published_at,
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

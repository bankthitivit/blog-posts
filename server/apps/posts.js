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
  const findCategoryId = await pool.query(
    `select * from categories where name ilike $1`,
    [newPost.category_name]
  );
  const category_id = findCategoryId.row[0].category_id;

  await pool.query(
    `
    insert into posts(post_id, user_id, category_id, post_vote_id, title, content, url, created_at, updated_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      51,
      newPost.user_id,
      category_id,
      newPost.post_vote_id,
      newPost.title,
      newPost.content,
      newPost.url,
      newPost.created_at,
      newPost.updated_at,
    ]
  );
  return res.json({
    message: "Post has been created.",
  });
});

postRouter.post("/:postId", async (req, res) => {
  const postId = req.params.postId;
  const newVote = {
    ...req.body,
  };
  await pool.query(
    `insert into post_votes(post_vote_id, post_id, user_id, type) values($1,$2,$3,$4)`,
    [12, postId, newVote.user_id, newVote.type]
  );
  return res.json({
    message: "Post has been voted.",
  });
});

postRouter.post("/:postId/comments", async (req, res) => {
  const newPost = {
    ...req.body,
    created_at: new Date(),
  };
  await pool.query(
    `insert into comments(comment_id, user_id, post_id, comment_vote_id, content, url, created_at) values($1,$2,$3,$4,$5,$6,$7)`,
    [
      51,
      newPost.user_id,
      newPost.category_id,
      newPost.comment_vote_id,
      newPost.content,
      newPost.url,
      newPost.created_at,
    ]
  );
  return res.json({
    message: "Comment has been created.",
  });
});

postRouter.post("/:postId/comments/:commentId", async (req, res) => {
  const commentId = req.params.commentId;
  const newVote = {
    ...req.body,
  };
  await pool.query(
    `insert into comment_votes(comment_vote_id, comment_id, user_id, type) values($1,$2,$3,$4)`,
    [37, commentId, newVote.user_id, newVote.type]
  );
  return res.json({
    message: "Comment has been voted.",
  });
});

postRouter.put("/:postId", async (req, res) => {
  const updatedPost = {
    ...req.body,
    updated_at: new Date(),
  };
  const postId = req.params.postId;

  await pool.query(
    `update posts set user_id=$1, category_id=$2, post_vote_id=$3, title=$4, content=$5, url=$6, updated_at=$7 where post_id=$8`,
    [
      updatedPost.user_id,
      updatedPost.category_id,
      updatedPost.post_vote_id,
      updatedPost.title,
      updatedPost.content,
      updatedPost.url,
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

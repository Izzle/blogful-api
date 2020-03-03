const path = require('path');
const express = require('express');
const xss = require('xss');

const ArticlesService = require('./articles-service');

const articlesRouter = express.Router();
const jsonParser = express.json();

const serializeArticle = article => ({
  id: article.id,
  title: xss(article.title),
  style: xss(article.style),
  content: xss(article.content),
  date_published: new Date(article.date_published).toLocaleString(),
});

articlesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
  
    ArticlesService.getAllArticles(knexInstance)
      .then(articles => {
        res.json(articles.map(serializeArticle));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, style, content, date_published } = req.body;
    const newArticle = { title, date_published };

    for (const [key, value] of Object.entries(newComment)) {
      if (value == null) { // eslint-disable-line eqeqeq
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    newArticle.style = style;
    newArticle.content = content;

    ArticlesService.insertArticle(
      req.app.get('db'),
      newArticle
    )
      .then(article => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${comment.id}`))
          .json(serializeArticle(article));
      })
      .catch(next);
  });
  
articlesRouter
  .route('/:article_id')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
  
    ArticlesService.getById(knexInstance, req.params.article_id)
      .then(article => {
        if(!article) {
          return res.status(404).json({
            error: { message: `Article doesn't exist` }
          });
        }
        res.json(serializeArticle(article));
      })
      .catch(next);
  });

module.exports = articlesRouter;
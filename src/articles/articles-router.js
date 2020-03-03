const express = require('express');
const xss = require('xss');

const ArticlesService = require('./articles-service');

const articlesRouter = express.Router();

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
        // res.json(articles.map(article => ({
        //   id: article.id,
        //   title: article.title,
        //   style: article.style,
        //   content: article.content,
        //   date_published: new Date(article.date_published).toLocaleString(),
        // })));
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
        //   res.json({
        //     id: article.id,
        //     title: article.title,
        //     style: article.style,
        //     content: article.content,
        //     date_published: new Date(article.date_published).toLocaleString()
        //   });
      })
      .catch(next);
  });

module.exports = articlesRouter;
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const { NODE_ENV } = require('./config');
const ArticlesService = require('./articles-service');
const usersRouter = require('./users/users-router');


const app = express();

const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use('/api/users', usersRouter);

app.get('/articles', (req, res, next) => {
  const knexInstance = req.app.get('db');

  ArticlesService.getAllArticles(knexInstance)
    .then(articles => {
      res.json(articles.map(article => ({
        id: article.id,
        title: article.title,
        style: article.style,
        content: article.content,
        date_published: new Date(article.date_published).toLocaleString(),
      })));
    })
    .catch(next);
});

app.get('/articles/:article_id', (req, res, next) => {
  const knexInstance = req.app.get('db');

  ArticlesService.getById(knexInstance, req.params.article_id)
    .then(article => {
      if(!article) {
        return res.status(404).json({
          error: { message: `Article doesn't exist` }
        });
      }
      res.json({
        id: article.id,
        title: article.title,
        style: article.style,
        content: article.content,
        date_published: new Date(article.date_published).toLocaleString()
      });
    })
    .catch(next);
});

app.get('/', (req, res, next) => { // eslint-disable-line no-unused-vars
  res.send('Hello, world!');
});

app.use(function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error'}};
  } else {
    console.error(error);
    response = { message: error.message, error};
  }
  res.status(500).json(response);
});

module.exports = app;
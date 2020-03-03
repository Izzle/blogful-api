const knex = require('knex');
const app = require('../src/app');
const { makeArticlesArray } = require('./articles.fixtures');

describe.only('Articles Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db); // tests skip server.js, but our app instance expects there to an 'db' knexinstance
  });
  

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db('blogful_articles').truncate());

  afterEach('cleanup', () => db('blogful_articles').truncate());

  describe('GET /api/articles', () => {
    context('Given no articles', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/articles')
          .expect(200, []);
      });
    });

    context('Given there are articles in the database', () => {
      const testArticles = makeArticlesArray();
    
      beforeEach('insert articles', () => {
        return db
          .into('blogful_articles')
          .insert(testArticles);
      });

      it('responds with 200 and all of the articles', function() {
        this.retries(3); // since we use timestamps and the seconds may not always match, we use Mochas retries to test it 3 times if needed

        return supertest(app)
          .get('/api/articles')
          .expect(200, testArticles);
      });
    });
  });

  describe('GET /api/articles/:article_id', () => {
    context('Given no articles', () => {
      it('responds with 404', () => {
        const articleId = 123456;
        return supertest(app)
          .get(`/api/articles/${articleId}`)
          .expect(404, { error: { message: `Article doesn't exist` }});
      });
    });

    context('Given there are articles in the database', () => {
      const testArticles = makeArticlesArray();
      
      beforeEach('insert articles', () => {
        return db
          .into('blogful_articles')
          .insert(testArticles);
      });

      it('responds with 200 and the specified article', function() {
        this.retries(3); // since we use timestamps and the seconds may not always match, we use Mochas retries to test it 3 times if needed
        const articleId = 2;
        const expectedArticle = testArticles[articleId - 1];
        return supertest(app)
          .get(`/api/articles/${articleId}`)
          .expect(200, expectedArticle);
      });
    });
  });

});
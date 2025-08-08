import app from '../app.js';
import request from 'supertest';

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    it('должен успешно зарегистрировать пользователя', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
        });
      
      expect(res.status).toBe(201);  
      console.log(res.body);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
    }, 15000);

    it('должен вернуть ошибку, если данные невалидные', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: '', // пустое имя
          email: 'invalid-email',
          password: '123',
        });

      expect(res.status).toBe(400);  // статус ошибки валидации
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      const res = await request(app).post('/auth/register').send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'Password123!',
      });
    });

    it('должен войти и вернуть JWT', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password123!',
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('refresh_token');
    });

    it('должен вернуть ошибку при неверном пароле', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword',
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  // TODO: Написать тесты для /logout, /confirm-email, /refresh-token
});
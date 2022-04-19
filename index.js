// 의존성 설정
const express = require('express');
const redis = require('redis'); // Redis 모듈 불러오기
const axios = require('axios');
const bodyParser = require('body-parser');

// 서비스 포트 선언
const port = 3005;

// createClient() 메서드는 새로운 RedisClient 객체를 생성하는데, 
// redis 서버와 express 서버가 같은 호스트에서 돌아가고 있다면 createClient() 에 별도의 설정을 해 주지 않아도 된다. 
// 만약 호스트가 다르다면 호스트 url, 포트 번호 등의 설정을 추가해주어야 한다.
const redisClient = redis.createClient();

// express 서버 설정
const app = express();

// Body Parser 미들웨어
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 캐시 체크를 위한 미들웨어
checkCache = (req, res, next) => {
    redisClient.get(req.url, (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      }
      // Redis에 저장된게 존재한다.
      if (data != null) {
        res.send(data);
      } else {
        // Redis에 저장된게 없기 때문에 다음 로직 실행
        next();
      }
    });
  };

app.get('/photos', checkCache, async (req, res) => {
    try {
      console.log(req.url)
      const {data} = await axios.get('https://jsonplaceholder.typicode.com/photos');
  
      await redisClient.setex(req.url, 1440, JSON.stringify(data));
  
      return res.json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  });

// express 서버를 3005번 포트로 실행;
app.listen(port, () => console.log(`Server running on Port ${port}`));
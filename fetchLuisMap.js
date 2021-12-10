const redisClass = require('./models/redis.js');
const redisStore = new redisClass.Redis();
const { fetchLuisMapFromDB } = require('./models/luisMapDB');

const fetchLuisMap = async (intent) => {
  return new Promise(async function(resolve, reject) {
    try {
      const fetchedData = await redisStore.get(intent);
      if (fetchedData == undefined) {
        const data = await fetchLuisMapFromDB(intent);
        if (data) {
          redisStore.set(intent, JSON.stringify(data), 'EX', 3600);
          resolve(data);
        } else {
          resolve(undefined);
        }
      } else {
        resolve(JSON.parse(fetchedData));
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports.fetchLuisMap = fetchLuisMap;

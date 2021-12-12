const request =  require('request');
const { parseString } = require('xml2js');

const xhrRequest = async function(
  url,
  options
){
  return new Promise(async (resolve, reject) => {
    await request(
      {
        url: url,
        qs: options,
        json: true
      },
      (error, response, body) => {
        if (error) {
          console.error({ location: 'xhrRequest request error 1', error: error });
          reject(error);
        } else {
          try {
            resolve(body);
          } catch (err) {
            console.error({ location: 'xhrRequest XLS to JSON 3', error: err });
            reject(err);
          }
        }
      }
    );
  });
};


const getWeather = async function() {
	const url =
		'http://api.openweathermap.org/data/2.5/weather?q=Boulder&units=metric&appid=eaf4589698e1670dfe70250dc42bffc3';
	const body = await xhrRequest(url);
    return body;
}

exports.getWeather = getWeather
// getWeather()
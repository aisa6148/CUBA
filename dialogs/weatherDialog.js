const {
    ComponentDialog,
    WaterfallDialog,
    DialogSet,
    DialogTurnStatus
  } = require('botbuilder-dialogs');
  const { getWeather } = require('../services/apicalls')
  
  class Weather extends ComponentDialog {
    constructor(dialogId) {
      super(dialogId);
  
      // validate what was passed in
      if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
      this.addDialog(new WaterfallDialog(dialogId, [
          this.lookForWeatherEvents.bind(this)
        ]));
    }
  
    async lookForWeatherEvents(step) {
        const apicallresponse = await getWeather();
        console.log(apicallresponse.weather[0]['main'])
        //API call to be made and response to be added to the string below
        return await step.context.sendActivity(
            "Current Temperature: " + apicallresponse.main.temp + "°C " + apicallresponse.weather[0].main +
            "\n\nFeels like: " + apicallresponse.main.feels_like + "°C " + 
            "\n\nTemperature Range: " + apicallresponse.main.temp_min + "°C to " + apicallresponse.main.temp_max + "°C "
            );
    }
  
    async run(turnContext, accessor) {
      const dialogSet = new DialogSet(accessor);
      dialogSet.add(this);
      const dialogContext = await dialogSet.createContext(turnContext);
      const results = await dialogContext.continueDialog();
      if (results.status === DialogTurnStatus.empty) {
        await dialogContext.beginDialog(this.id);
      }
    }
  }
  
  module.exports.WeatherDialog = Weather;
  
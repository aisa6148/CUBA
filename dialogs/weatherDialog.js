const {
    ComponentDialog,
    WaterfallDialog,
    DialogSet,
    DialogTurnStatus
  } = require('botbuilder-dialogs');
  
  class Weather extends ComponentDialog {
    constructor(dialogId) {
      super(dialogId);
  
      // validate what was passed in
      if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
      this.addDialog(new WaterfallDialog(dialogId, [this.lookForWeatherEvents.bind(this)]));
    }
  
    async lookForWeatherEvents(step) {
      return await await step.context.sendActivity("Kays");
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
  
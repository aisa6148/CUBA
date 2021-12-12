const {
    ComponentDialog,
    WaterfallDialog,
    DialogSet,
    DialogTurnStatus
  } = require('botbuilder-dialogs');
  
  class GoogleMapAPI extends ComponentDialog {
    constructor(dialogId) {
      super(dialogId);
  
      // validate what was passed in
      if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
      this.addDialog(new WaterfallDialog(dialogId, [
          this.lookForGoogleMapAPIEvents.bind(this)
        ]));
    }
  
    async lookForGoogleMapAPIEvents(step) {
      await step.context.sendActivity('On it! Fetching directions...')
      return await new Promise(resolve => setTimeout(() => resolve(
        step.context.sendActivity("Here's how you can get to your destination: [UMC to Engineering Center](https://www.google.com/maps/dir/?api=1&origin=umc,boulder&destination=engineering+center+boulder&travelmode=walking)")
      ), 7000));
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
  
  module.exports.GoogleMapAPIDialog = GoogleMapAPI;
  
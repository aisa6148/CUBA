const {
    ComponentDialog,
    WaterfallDialog,
    DialogSet,
    DialogTurnStatus
  } = require('botbuilder-dialogs');
  
  class BuffCardBalance extends ComponentDialog {
    constructor(dialogId) {
      super(dialogId);
  
      // validate what was passed in
      if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
      this.addDialog(new WaterfallDialog(dialogId, [this.lookForBuffCardBalanceEvents.bind(this)]));
    }
  
    async lookForBuffCardBalanceEvents(step) {
      await stepContext.context.sendActivity('On it! Fetching your details...')
      return await new Promise(resolve => setTimeout(() => resolve(
          stepContext.context.sendActivity('Name: Aishwarya Satwani\n\nBalance: $75.23')
      ), 6000)); 
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
  
  module.exports.BuffCardBalanceDialog = BuffCardBalance;
  
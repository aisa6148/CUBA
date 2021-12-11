const {
  ComponentDialog,
  WaterfallDialog,
  DialogSet,
  DialogTurnStatus
} = require('botbuilder-dialogs');
const { CalendarDialog } = require('../dialogs/calendarDialog');
const { WeatherDialog } = require('../dialogs/weatherDialog');
const { DirectionsDialog } = require('../dialogs/directionsDialog');
const { BuffCardBalanceDialog } = require('../dialogs/buffCardBalanceDialog');

class Redirect extends ComponentDialog {
  constructor(dialogId) {
    super(dialogId);

    // validate what was passed in
    if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
    this.addDialog(new WaterfallDialog(dialogId, [this.redirect.bind(this)]));
    this.addDialog(new CalendarDialog('CalendarDialog'));
    this.addDialog(new WeatherDialog('WeatherDialog'));
    this.addDialog(new DirectionsDialog('DirectionsDialog'));
    this.addDialog(new BuffCardBalanceDialog('BuffCardBalanceDialog'));
  }

  async redirect(step) {
    const { dialogId, entities } = step.options;
    if (!dialogId || !this.findDialog(dialogId)) {
      const didntUnderstandMessageText = `Sorry, I didn't get that. Please try asking in a different way`;
                await stepContext.context.sendActivity(didntUnderstandMessageText);
    }
    return await step.replaceDialog(dialogId, { entities });
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

module.exports.RedirectDialog = Redirect;

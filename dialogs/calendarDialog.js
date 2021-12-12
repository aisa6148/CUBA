const {
    ComponentDialog,
    WaterfallDialog,
    DialogSet,
    DialogTurnStatus
  } = require('botbuilder-dialogs');
const calendar = require('../calendar');
function timeManipulation (time) {
  return time.split('T')[1].split("-")[0].split(":")[0] + ":" + time.split('T')[1].split("-")[0].split(":")[1]
}

  class Calendar extends ComponentDialog {
    constructor(dialogId) {
      super(dialogId);
  
      // validate what was passed in
      if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
      this.addDialog(new WaterfallDialog(dialogId, [this.lookForCalendarEvents.bind(this)]));
    }
  
    async lookForCalendarEvents(step) { 
      if(calendar.events[0].length) {
        await step.context.sendActivity("You have the following events for today:");
        for(let event1 of calendar.events[0]) {
          await step.context.sendActivity(
            event1.summary + "\n\n" + timeManipulation(event1.start.dateTime) + " - " + timeManipulation(event1.end.dateTime)
          );
        }
      } else {
        await step.context.sendActivity("No upcoming events!");
      }
      return await step.context.sendActivity("Have a great day!");
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
  
  module.exports.CalendarDialog = Calendar;
  
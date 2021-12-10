const {
  ComponentDialog,
  WaterfallDialog,
  DialogSet,
  DialogTurnStatus
} = require('botbuilder-dialogs');
const { sendRichCard, deliverMessages } = require('../helper.functions');
const { fetchLuisMap } = require('../fetchLuisMap');
const { RedirectDialog } = require('./redirectDialog');
const GENERAL = 'General';
class LuisMap extends ComponentDialog {
  constructor(dialogId) {
    super(dialogId);
    // validate what was passed in
    if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
    this.addDialog(new WaterfallDialog(dialogId, [this.start.bind(this)]));
    this.addDialog(new RedirectDialog('RedirectDialog'));
  }

  async start(step) {
    const { intent, entities } = step.options;
    const mappedDialog = await fetchLuisMap(intent);
    console.log(
      {
        location: 'luisMap start',
        intent,
        entities
      },
      step.context.activity
    );
    if (mappedDialog) {
      switch (mappedDialog.type) {
        case 'DirectDialog':
          return await this.directDialogFunction(step, mappedDialog);
        case 'RedirectDialog':
          return await step.replaceDialog('RedirectDialog', {
            dialogId: mappedDialog.value,
            entities
          });
        default:
          return await step.replaceDialog('UnknownDialog');
      }
    } else {
        return await step.replaceDialog('UnknownDialog');
    }
  }

  async directDialogFunction(step, mappedDialog) {
    const messages = mappedDialog.messages;
    await deliverMessages(step.context, messages);
    return await step.cancelAllDialogs();
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

module.exports.LuisMap = LuisMap;


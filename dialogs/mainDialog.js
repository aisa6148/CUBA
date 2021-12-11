// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { MessageFactory, InputHints } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const helperfunction = require('../helper.functions');
const { CalendarDialog } = require('../dialogs/calendarDialog');
const { WeatherDialog } = require('../dialogs/weatherDialog');
const { DirectionsDialog } = require('../dialogs/directionsDialog');
const { LuisMap } = require('./luisMap.dialog')

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

const findTerm = (string, substring) => {
    if (string.includes(substring)){
      return string;
    }
};

class MainDialog extends ComponentDialog {
    constructor(luisRecognizer, bookingDialog) {
        super('MainDialog');

        if (!luisRecognizer) throw new Error('[MainDialog]: Missing parameter \'luisRecognizer\' is required');
        this.luisRecognizer = luisRecognizer;

        if (!bookingDialog) throw new Error('[MainDialog]: Missing parameter \'bookingDialog\' is required');

        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(new LuisMap('LuisMap'))
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.actStep.bind(this)
            ]));
        this.addDialog(new CalendarDialog('CalendarDialog'));
        this.addDialog(new WeatherDialog('WeatherDialog'));
        this.addDialog(new DirectionsDialog('DirectionsDialog'));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async actStep(stepContext) {
        const text = stepContext.context.activity.text;
        if (text.match(/^#[0-9a-zA-Z_#]+$/)) {
            const split = text.trim().split('#');
            if (split.length < 3) {
                // do nothing
            } else {
                const intent = split[2];
                const entities = [];
                if (split.length > 3) {
                    entities.push({
                        entity: split[3],
                        type: split[3],
                        score: 1,
                    });
                }
                await stepContext.beginDialog('LuisMap', {
                    intent,
                    entities,
                });
            }
        } else {
            const luisResult = await this.luisRecognizer.executeLuisQuery(stepContext.context);
            switch (LuisRecognizer.topIntent(luisResult)) {
            case 'Greeting':
                const greeting = 'Hey there! I am the CU Boulder Assistant at your service! I can help you out with the following, click on an option and get started:'
                await helperfunction.sendRichCard(
                    stepContext.context,
                    greeting,
                    [
                        { "display": "Today's Calendar", "value": "#Greeting#Calendar" },
                        { "display": "FAQ", "value": "#CUInfo#FAQ" },
                        { "display": "Buff Card Balance", "value": "#BuffCard#BuffCardBalance" },
                        { "display": "Weather Today", "value": "#Weather#Weather" },
                        { "display": "Directions", "value": "#Directions#GetDirections" },
                    ]
                  );
                break;
            case findTerm(LuisRecognizer.topIntent(luisResult), 'Calendar'): {
                    return await stepContext.replaceDialog('CalendarDialog');
                }
            case findTerm(LuisRecognizer.topIntent(luisResult), 'Weather'): {
                    return await stepContext.replaceDialog('WeatherDialog');
                }
            case 'BuffCardBalance': {
                await stepContext.context.sendActivity('On it! Fetching your details...')
                await new Promise(resolve => setTimeout(() => resolve(
                    stepContext.context.sendActivity('Name: Aishwarya Satwani\n\nBalance: $75.23')
                ), 6000));                 
                break;
            }
            case 'GetDirections': {
                return await stepContext.replaceDialog('DirectionsDialog');
            }
    
            default: {
                // Catch all for unhandled intents
                const didntUnderstandMessageText = `Sorry, I didn't get that. Please try asking in a different way`;
                await stepContext.context.sendActivity(didntUnderstandMessageText, didntUnderstandMessageText, InputHints.IgnoringInput);
            }
            }
        }

        return await stepContext.cancelAllDialogs();
    }
}

module.exports.MainDialog = MainDialog;

const {
  CardFactory,
  ActivityTypes,
  ActionTypes,
} = require('botbuilder');

function santitizeString(text) {
  text = text.replace(/\[(.*?)\]\((.*?)\)/, '<$2|$1>');
  text = text.replace(/&#160;/g, ' ');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&apos;/g, "'");
  text = text.replace(/&amp;/g, '&');
  return text;
}

const card = (
  text,
  buttons,
  cardType
) => {
  const reply = { type: ActivityTypes.Message };
  const cardAction = [];
  buttons.forEach(button => {
    cardAction.push({
      type: cardType || ActionTypes.PostBack,
      title: button.display,
      value: button.value,
      text: button.value
    });
  });
  const card = CardFactory.heroCard('', undefined, cardAction, { text });
  reply.attachments = [card];
  return reply;
};

const sendRichCard = async (context, text, options) => {
  if (context.activity.channelId == 'slack') text = santitizeString(text);
  const activity = card(text, options, ActionTypes.PostBack);
  await context.sendActivity(activity);
};

const send = async (context, text) => {
  try {
    if (context.activity.channelId === 'slack') text = santitizeString(text);
    await context.sendActivity(text);
  } catch (error) {
    console.error({ location: 'helperfunctions send', error: error });
  }
};

const deliverMessages = async (context, messages) => {
  for (const message of messages) {
    if (message.buttons) {
      await sendRichCard(context, message.text, message.buttons);
    } else {
      console.log(message)
      await send(context, message.text);
    }
  }
};


exports.sendRichCard = sendRichCard;
exports.send = send;
exports.deliverMessages = deliverMessages;


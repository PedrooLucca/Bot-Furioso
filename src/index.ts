import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
    throw new Error('BOT_TOKEN não encontrado no arquivo .env');
}

const bot = new TelegramBot(token, { polling: true });

// Comando /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const opts = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🎮 Time Atual', callback_data: 'roster' },
                    { text: '🏆 Próximas Partidas', callback_data: 'matches' }
                ],
                [
                    { text: '📊 Ranking Mundial', callback_data: 'ranking' },
                    { text: '❓ Ajuda', callback_data: 'help' }
                ]
            ]
        }
    };

    bot.sendMessage(
        chatId,
        `🐯 Bem-vindo ao Bot Oficial de Fãs da FURIA CS!

Escolha uma opção abaixo para começar:`,
        opts
    );
});

// Tratamento dos callbacks
bot.on('callback_query', async (callbackQuery) => {
    if (!callbackQuery.message) return;

    const chatId = callbackQuery.message.chat.id;
    const action = callbackQuery.data;

    switch (action) {
        case 'roster':
            bot.sendMessage(chatId, `🎮 Time Atual da FURIA CS:

• art (Andrei Piovezan)
• KSCERATO (Kaike Cerato)
• yuurih (Yuri Santos)
• chelo (Rafael Kapp)
• saffee (Rafael Costa)

🎓 Coach: guerri (Nicholas Nogueira)`);
            break;

        case 'matches':
            bot.sendMessage(chatId, `🏆 Próximas partidas:
Em breve!`);
            break;

        case 'ranking':
            bot.sendMessage(chatId, `📊 Ranking Mundial:
Em breve!`);
            break;

        case 'help':
            bot.sendMessage(chatId, `❓ Comandos Disponíveis:

/start - Iniciar o bot
/help - Ver esta mensagem`);
            break;
    }

    // Responde ao callback para remover o loading
    bot.answerCallbackQuery(callbackQuery.id);
});

console.log('Bot está rodando! 🚀');

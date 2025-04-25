import dotenv from 'dotenv';
import TelegramBot, { InlineKeyboardButton } from 'node-telegram-bot-api';
import { HLTVService } from './services/HLTVService';

dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
    throw new Error('BOT_TOKEN não encontrado no arquivo .env');
}

const bot = new TelegramBot(token, { polling: true });

function sendInlineKeyboard(chatId: number, text: string, keyboard: InlineKeyboardButton[][]): void {
    const options = {
        reply_markup: { inline_keyboard: keyboard }
    };
    bot.sendMessage(chatId, text, options);
}

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const keyboard: InlineKeyboardButton[][] = [
        [
            { text: '🎮 Time atual', callback_data: 'jogadores' },
            { text: '🏆 Próximas Partidas', callback_data: 'matches' }
        ],
        [
            { text: '📊 Ranking Mundial', callback_data: 'ranking' },
            { text: '❓ Ajuda', callback_data: 'help' }
        ]
    ];

    sendInlineKeyboard(
        chatId,
        `🐯 Bem-vindo ao Bot Oficial de Fãs da FURIA CS!

Escolha uma opção abaixo para começar:`,
        keyboard
    );
});



bot.onText(/\/time/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        const team = await HLTVService.getFuriaTeamInfo();
        const teamInfo = `
🎮 *${team.name}* (ID: ${team.id})

👥 Jogadores:
${team.players.map(player => `- ${player.name} (${player.id})`).join('\n')}
        `;
        bot.sendMessage(chatId, teamInfo, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, '❌ Não foi possível obter informações do time da FURIA.');
    }
});

bot.onText(/\/jogadores/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        const players = await HLTVService.getFuriaPlayers();
        const playersInfo = players.map((player, index) => {
            if (index >= 5 && index < players.length - 1) {
                return `• *${player.name}* (BENCHED)`;
            } else if (index === players.length - 1) {
                return `• *${player.name}* (COACH)`;
            } else {
                return `• *${player.name}*`;
            }
        }).join('\n');

        bot.sendMessage(chatId, `🔥 *Jogadores da FURIA* 🔥\n\n${playersInfo}`, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, '❌ Não foi possível obter informações dos jogadores da FURIA.');
    }
});

bot.on('callback_query', async (callbackQuery) => {
    if (!callbackQuery.message) return;

    const chatId = callbackQuery.message.chat.id;
    const action = callbackQuery.data;

    const responses: Record<string, string> = {
        roster: `🎮 Time Atual da FURIA CS:\n\n• FalleN (Gabriel Toledo)\n• KSCERATO (Kaike Cerato)\n• yuurih (Yuri Boian)\n• molodoy (Danil Golubenko)\n• YEKINDAR (Mareks Gaļinskis)\n\n🎓 Coach: sidde (Sidnei Macedo)`,
        matches: '🏆 Próximas partidas da FURIA: Em breve!',
        ranking: '📊 Ranking Mundial: Em breve!',
        help: `❓ Comandos Disponíveis:\n\n/start - Iniciar o bot\n/ajuda - Ver esta mensagem`
    };

    if (action && responses[action]) {
        bot.sendMessage(chatId, responses[action]);
    } else {
        bot.sendMessage(chatId, '❌ Ação desconhecida.');
    }

    bot.answerCallbackQuery(callbackQuery.id);
});

console.log('Bot está rodando! 🚀');

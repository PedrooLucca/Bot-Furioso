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

// Comando /start
// Envia uma mensagem de boas-vindas e um menu com opções
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '📋 Jogadores', callback_data: 'jogadores' }],
                [{ text: '🏆 Próximas Partidas', callback_data: 'partidas' }],
                [{ text: '🌍 Ranking Mundial', callback_data: 'ranking' }]
            ]
        }
    };

    bot.sendMessage(chatId, 'Bem-vindo ao Bot da FURIA! Escolha uma opção:', options);
});

// Comando /jogadores
// Envia uma mensagem com a lista de jogadores da FURIA
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

// Botão jogadores
// Envia uma mensagem com a lista de jogadores da FURIA
bot.on('callback_query', async (callbackQuery) => {
    if (!callbackQuery.message) return;

    const chatId = callbackQuery.message.chat.id;
    const action = callbackQuery.data;

    if (action === 'jogadores') {
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
    } 
});

// Botão partidas
// Envia uma mensagem com as próximas partidas da FURIA
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message?.chat.id;
    const data = callbackQuery.data;

    if (data === 'partidas') {
        try {
            const partidas = await HLTVService.getUpcomingMatches();
            if (partidas.length === 0) {
                bot.sendMessage(chatId!, '🏆 Não há partidas futuras agendadas para a FURIA.');
                return;
            }

            const partidasInfo = partidas.map(match => {
                const date = new Date(match.date || 0).toLocaleString('pt-BR');
                return `• ${match.team1?.name || 'TBD'} vs ${match.team2?.name || 'TBD'}\n  🕒 ${date}`;
            }).join('\n\n');

            bot.sendMessage(chatId!, `🏆 *Próximas Partidas da FURIA* 🏆\n\n${partidasInfo}`, { parse_mode: 'Markdown' });
        } catch (error) {
            bot.sendMessage(chatId!, '❌ Não foi possível obter as próximas partidas.');
        }
    }
});



console.log('Bot está rodando! 🚀');

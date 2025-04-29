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
                [{ text: '🌍 Ranking Mundial', callback_data: 'ranking' }],
                [{ text: '📜 Histórico de Partidas', callback_data: 'historico' }],
                [{ text: '📊 Estatísticas', callback_data: 'estatisticas' }] 
            ]
        }
    };

    bot.sendMessage(chatId, 'Bem-vindo ao Bot FURIOSO! Escolha uma opção:', options);
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
                const date = new Date(match.date || 0).toLocaleDateString('pt-BR'); // Apenas a data
                return `• ${match.team1?.name || 'TBD'} vs ${match.team2?.name || 'TBD'}\n  📅 ${date}`;
            }).join('\n\n');

            bot.sendMessage(chatId!, `🏆 *Próximas Partidas da FURIA* 🏆\n\n${partidasInfo}`, { parse_mode: 'Markdown' });
        } catch (error) {
            bot.sendMessage(chatId!, '❌ Não foi possível obter as próximas partidas.');
        }
    }
});

// Botão ranking
// Envia uma mensagem com o ranking mundial da FURIA
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message?.chat.id;
    const data = callbackQuery.data;

    if (data === 'ranking') {
        try {
            const furiaRanking = await HLTVService.getFuriaRanking();

            if (furiaRanking) {
                bot.sendMessage(
                    chatId!,
                    `🌍 *Ranking Mundial da FURIA* 🌍\n\n` +
                    `• Posição: *${furiaRanking.position}*\n` +
                    `• Pontos: *${furiaRanking.points}*`,
                    { parse_mode: 'Markdown' }
                );
            } else {
                bot.sendMessage(chatId!, '❌ A FURIA não está no ranking mundial atualmente.');
            }
        } catch (error) {
            bot.sendMessage(chatId!, '❌ Não foi possível obter o ranking da FURIA.');
        }
    }
});

// Botão histórico
// Envia uma mensagem com o histórico de partidas da FURIA
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message?.chat.id;
    const data = callbackQuery.data;

    if (data === 'historico') {
        try {
            const matchHistory = await HLTVService.getFuriaMatchHistory();

            if (matchHistory.length === 0) {
                bot.sendMessage(chatId!, '📜 Não há histórico de partidas disponível para a FURIA.');
                return;
            }

            const historyInfo = matchHistory.map(match => {
                const date = match.date ? new Date(match.date).toLocaleDateString('pt-BR') : 'Data desconhecida';
                const team1 = match.team1?.name || 'TBD';
                const team2 = match.team2?.name || 'TBD';

                return `• ${team1} vs ${team2}\n  📅 ${date}`; 
            }).join('\n\n');

            bot.sendMessage(chatId!, `📜 *Histórico de Partidas da FURIA* 📜\n\n${historyInfo}`, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('Erro ao buscar histórico de partidas:', error);
            bot.sendMessage(chatId!, '❌ Não foi possível obter o histórico de partidas da FURIA.');
        }
    }
});

console.log('Bot está rodando! 🚀');

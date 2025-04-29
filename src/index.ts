import dotenv from 'dotenv';
import TelegramBot, { InlineKeyboardButton } from 'node-telegram-bot-api';
import { HLTVService } from './services/HLTVService';
import schedule from 'node-schedule';

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

// Lista de usuários inscritos para notificações
const subscribedUsers: Set<number> = new Set();

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
                [{ text: '📊 Estatísticas', callback_data: 'estatisticas' }],
                [{ text: '🔗 Links Úteis', callback_data: 'links_uteis' }],
                [
                    { text: '🔔 Ativar Notificações', callback_data: 'ativar_notificacoes' },
                    { text: '❌ Desativar Notificações', callback_data: 'desativar_notificacoes' }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, 'Bem-vindo ao Bot FURIOSO! Escolha uma opção:', options);
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

// Botão estatísticas
// Envia uma mensagem com as estatísticas dos jogadores da FURIA
bot.on('callback_query', async (callbackQuery) => {
    if (!callbackQuery.message) return;

    const chatId = callbackQuery.message.chat.id;
    const action = callbackQuery.data;

    if (action === 'estatisticas') {
        try {
            const players = await HLTVService.getFuriaPlayers();
            const statsPromises = players.map(async (player) => {
                try {
                    const stats = await HLTVService.getPlayerStats(player.id);
                    return `• *${stats.name}*\n  ${stats.stats}`;
                } catch {
                    return `• *${player.name}*\n  Estatísticas indisponíveis.`;
                }
            });

            const statsInfo = await Promise.all(statsPromises);

            bot.sendMessage(chatId, `📊 *Estatísticas dos Jogadores da FURIA* 📊\n\n${statsInfo.join('\n\n')}`, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('Erro ao buscar estatísticas dos jogadores:', error);
            bot.sendMessage(chatId, '❌ Não foi possível obter as estatísticas dos jogadores da FURIA.');
        }
    }
});

// Callback para "Links Úteis"
bot.on('callback_query', (callbackQuery) => {
    if (!callbackQuery.message) return;

    const chatId = callbackQuery.message.chat.id;
    const action = callbackQuery.data;

    if (action === 'links_uteis') {
        const links = `
🔗 *Links Úteis da FURIA* 🔗

• [Site Oficial da FURIA](https://www.furia.gg)
• [Twitter da FURIA](https://twitter.com/FURIA)
• [Instagram da FURIA](https://www.instagram.com/furiagg)
• [HLTV da FURIA](https://www.hltv.org/team/8297/furia)
        `;

        bot.sendMessage(chatId, links, { parse_mode: 'Markdown' });
    }
});

// Callback para ativar notificações
bot.on('callback_query', (callbackQuery) => {
    if (!callbackQuery.message) return;

    const chatId = callbackQuery.message.chat.id;
    const action = callbackQuery.data;

    if (action === 'ativar_notificacoes') {
        if (subscribedUsers.has(chatId)) {
            bot.sendMessage(chatId, '✅ Você já está inscrito para receber notificações.');
        } else {
            subscribedUsers.add(chatId);
            bot.sendMessage(chatId, '🔔 Notificações ativadas! Você receberá atualizações sobre as próximas partidas da FURIA.');
        }
    }

    if (action === 'desativar_notificacoes') {
        if (subscribedUsers.has(chatId)) {
            subscribedUsers.delete(chatId);
            bot.sendMessage(chatId, '❌ Notificações desativadas. Você não receberá mais atualizações.');
        } else {
            bot.sendMessage(chatId, '⚠️ Você não está inscrito para receber notificações.');
        }
    }
});

// Função para enviar notificações automáticas
async function sendMatchNotifications() {
    try {
        const upcomingMatches = await HLTVService.getUpcomingMatches();

        if (upcomingMatches.length === 0) {
            console.log('Nenhuma partida futura encontrada.');
            return;
        }

        const matchInfo = upcomingMatches.map(match => {
            const date = new Date(match.date || 0).toLocaleString('pt-BR');
            return `• ${match.team1?.name || 'TBD'} vs ${match.team2?.name || 'TBD'}\n  📅 ${date}`;
        }).join('\n\n');

        const message = `🏆 *Próximas Partidas da FURIA* 🏆\n\n${matchInfo}`;

        subscribedUsers.forEach(chatId => {
            bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        });

        console.log('Notificações enviadas com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar notificações automáticas:', error);
    }
}

// Agendamento para verificar partidas futuras a cada 6 horas
schedule.scheduleJob('0 */6 * * *', () => {
    console.log('Verificando partidas futuras para notificações...');
    sendMatchNotifications();
});

console.log('Bot está rodando! 🚀');

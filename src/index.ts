import dotenv from 'dotenv';
import TelegramBot, { InlineKeyboardButton } from 'node-telegram-bot-api';
import { HLTVService } from './services/HLTVService';
import schedule from 'node-schedule';
import { handlePlayersCallback } from './callbacks/playersCallback';
import { handleMatchesCallback } from './callbacks/matchesCallback';
import { handleRankingCallback } from './callbacks/rankingCallback';
import { handleHistoryCallback } from './callbacks/historyCallback';
import { handleStatsCallback } from './callbacks/statsCallback';

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

bot.on('callback_query', async (callbackQuery) => {
    if (!callbackQuery.message) return;

    const chatId = callbackQuery.message.chat.id;
    const action = callbackQuery.data;

    switch (action) {
        case 'jogadores':
            await handlePlayersCallback(bot, chatId);
            break;
        case 'partidas':
            await handleMatchesCallback(bot, chatId);
            break;
        case 'ranking':
            await handleRankingCallback(bot, chatId);
            break;
        case 'historico':
            await handleHistoryCallback(bot, chatId);
            break;
        case 'estatisticas':
            await handleStatsCallback(bot, chatId);
            break;
        case 'links_uteis':
            const links = `
🔗 *Links Úteis da FURIA* 🔗

• [Site Oficial da FURIA](https://www.furia.gg)
• [Twitter da FURIA](https://twitter.com/FURIA)
• [Instagram da FURIA](https://www.instagram.com/furiagg)
• [HLTV da FURIA](https://www.hltv.org/team/8297/furia)
            `;

            bot.sendMessage(chatId, links, { parse_mode: 'Markdown' });
            break;
        case 'ativar_notificacoes':
            if (subscribedUsers.has(chatId)) {
                bot.sendMessage(chatId, '✅ Você já está inscrito para receber notificações.');
            } else {
                subscribedUsers.add(chatId);
                bot.sendMessage(chatId, '🔔 Notificações ativadas! Você receberá atualizações sobre as próximas partidas da FURIA.');
            }
            break;
        case 'desativar_notificacoes':
            if (subscribedUsers.has(chatId)) {
                subscribedUsers.delete(chatId);
                bot.sendMessage(chatId, '❌ Notificações desativadas. Você não receberá mais atualizações.');
            } else {
                bot.sendMessage(chatId, '⚠️ Você não está inscrito para receber notificações.');
            }
            break;
        default:
            bot.sendMessage(chatId, '❌ Ação desconhecida.');
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
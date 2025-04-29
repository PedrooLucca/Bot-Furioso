import { HLTVService } from '../services/HLTVService';
import TelegramBot from 'node-telegram-bot-api';

export const handleMatchesCallback = async (bot: TelegramBot, chatId: number): Promise<void> => {
    try {
        const partidas = await HLTVService.getUpcomingMatches();
        if (partidas.length === 0) {
            bot.sendMessage(chatId, '🏆 Não há partidas futuras agendadas para a FURIA.');
            return;
        }

        const partidasInfo = partidas.map(match => {
            const date = new Date(match.date || 0).toLocaleDateString('pt-BR');
            return `• ${match.team1?.name || 'TBD'} vs ${match.team2?.name || 'TBD'}\n  📅 ${date}`;
        }).join('\n\n');

        bot.sendMessage(chatId, `🏆 *Próximas Partidas da FURIA* 🏆\n\n${partidasInfo}`, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, '❌ Não foi possível obter as próximas partidas.');
    }
};
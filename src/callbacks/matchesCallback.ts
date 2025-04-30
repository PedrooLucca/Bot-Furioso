import { HLTVService } from '../services/HLTVService';
import TelegramBot from 'node-telegram-bot-api';
import { MatchPreview } from 'hltv';

const LOCALE_DATE_FORMAT = 'pt-BR';

// Formata as informações de uma partida
const formatMatchInfo = (match: MatchPreview): string => {
    const date = new Date(match.date || 0).toLocaleDateString(LOCALE_DATE_FORMAT);
    return `• ${match.team1?.name || 'TBD'} vs ${match.team2?.name || 'TBD'}\n  📅 ${date}`;
};

// Lida com o callback para exibir as próximas partidas
export const handleMatchesCallback = async (bot: TelegramBot, userChatId: number): Promise<void> => {
    try {
        const partidas = await HLTVService.getUpcomingMatches();
        if (partidas.length === 0) {
            bot.sendMessage(userChatId, '🏆 Não há partidas futuras agendadas para a FURIA.');
            return;
        }

        const partidasInfo = partidas.map(formatMatchInfo).join('\n\n');
        bot.sendMessage(userChatId, `🏆 *Próximas Partidas da FURIA* 🏆\n\n${partidasInfo}`, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Erro ao obter partidas futuras:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        bot.sendMessage(userChatId, `❌ Não foi possível obter as próximas partidas. Erro: ${errorMessage}`);
    }
};
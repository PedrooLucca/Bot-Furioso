import { HLTVService } from '../services/HLTVService';
import TelegramBot from 'node-telegram-bot-api';

export const handleHistoryCallback = async (bot: TelegramBot, chatId: number): Promise<void> => {
    try {
        const matchHistory = await HLTVService.getFuriaMatchHistory();

        if (matchHistory.length === 0) {
            bot.sendMessage(chatId, '📜 Não há histórico de partidas disponível para a FURIA.');
            return;
        }

        const historyInfo = matchHistory.map(match => {
            const date = match.date ? new Date(match.date).toLocaleDateString('pt-BR') : 'Data desconhecida';
            const team1 = match.team1?.name || 'TBD';
            const team2 = match.team2?.name || 'TBD';
            const result = match.result ? `Resultado: ${match.result.team1} - ${match.result.team2}` : 'Resultado indisponível';

            return `• ${team1} vs ${team2}\n  📅 ${date}\n  ${result}`;
        }).join('\n\n');

        bot.sendMessage(chatId, `📜 *Histórico de Partidas da FURIA* 📜\n\n${historyInfo}`, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Erro ao buscar histórico de partidas:', error);
        bot.sendMessage(chatId, '❌ Não foi possível obter o histórico de partidas da FURIA.');
    }
};
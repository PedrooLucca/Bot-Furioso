import { HLTVService, FullMatchResult } from '../services/HLTVService';
import TelegramBot from 'node-telegram-bot-api';

const NO_HISTORY_MESSAGE = '📜 Não há histórico de partidas disponível para a FURIA.';
const ERROR_MESSAGE = '❌ Não foi possível obter o histórico de partidas da FURIA.';

const formatMatchHistory = (matchHistory: FullMatchResult[]): string => {
    return matchHistory.map(match => {
        const date = match.date ? new Date(match.date).toLocaleDateString('pt-BR') : 'Data desconhecida';
        const team1 = match.team1?.name || 'TBD';
        const team2 = match.team2?.name || 'TBD';
        const result = match.result ? `Resultado: ${match.result.team1} - ${match.result.team2}` : 'Resultado indisponível';

        return `• ${team1} vs ${team2}\n  📅 ${date}\n  ${result}`;
    }).join('\n\n');
};

// Lida com o callback do histórico de partidas da FURIA no Telegram.
export const handleHistoryCallback = async (bot: TelegramBot, chatId: number): Promise<void> => {
    try {
        const matchHistory = await HLTVService.getFuriaMatchHistory();

        if (matchHistory.length === 0) {
            bot.sendMessage(chatId, NO_HISTORY_MESSAGE);
            return;
        }

        // Formata o histórico de partidas e envia a mensagem para o chat.
        const historyInfo = formatMatchHistory(matchHistory);
        bot.sendMessage(chatId, `📜 *Histórico de Partidas da FURIA* 📜\n\n${historyInfo}`, { parse_mode: 'Markdown' });
    } catch (error) {
        // Lida com erros ao buscar o histórico de partidas e notifica o usuário.
        console.error('Erro ao buscar histórico de partidas:', (error as Error).message, (error as Error).stack);
        bot.sendMessage(chatId, ERROR_MESSAGE);
    }
};
import { HLTVService } from '../services/HLTVService';
import TelegramBot from 'node-telegram-bot-api';

// Constantes para mensagens e emojis
const WORLD_RANKING_TITLE = '🌍 *Ranking Mundial da FURIA* 🌍';
const NO_RANKING_MESSAGE = '❌ A FURIA não está no ranking mundial atualmente.';
const ERROR_MESSAGE = '❌ Não foi possível obter o ranking da FURIA.';

// Lida com o callback para buscar e exibir o ranking mundial da FURIA
export const handleRankingCallback = async (bot: TelegramBot, chatId: number): Promise<void> => {
    try {
        // Obtém o ranking mundial da FURIA usando o serviço HLTV
        const furiaRanking = await HLTVService.getFuriaRanking();

        // Verifica se o ranking foi encontrado e envia a mensagem correspondente
        if (furiaRanking) {
            bot.sendMessage(
                chatId,
                `${WORLD_RANKING_TITLE}\n\n` +
                `• Posição: *${furiaRanking.position}*\n` +
                `• Pontos: *${furiaRanking.points}*`,
                { parse_mode: 'Markdown' }
            );
        } else {
            // Caso a FURIA não esteja no ranking, envia uma mensagem informativa
            bot.sendMessage(chatId, NO_RANKING_MESSAGE);
        }
    } catch (error) {
        // Loga o erro no console e envia uma mensagem de erro
        console.error('Erro ao obter o ranking da FURIA:', error);
        bot.sendMessage(chatId, ERROR_MESSAGE);
    }
};
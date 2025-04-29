import { HLTVService } from '../services/HLTVService';
import TelegramBot from 'node-telegram-bot-api';

export const handleRankingCallback = async (bot: TelegramBot, chatId: number): Promise<void> => {
    try {
        const furiaRanking = await HLTVService.getFuriaRanking();

        if (furiaRanking) {
            bot.sendMessage(
                chatId,
                `🌍 *Ranking Mundial da FURIA* 🌍\n\n` +
                `• Posição: *${furiaRanking.position}*\n` +
                `• Pontos: *${furiaRanking.points}*`,
                { parse_mode: 'Markdown' }
            );
        } else {
            bot.sendMessage(chatId, '❌ A FURIA não está no ranking mundial atualmente.');
        }
    } catch (error) {
        bot.sendMessage(chatId, '❌ Não foi possível obter o ranking da FURIA.');
    }
};
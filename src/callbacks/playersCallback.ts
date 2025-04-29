import { HLTVService } from '../services/HLTVService';
import TelegramBot from 'node-telegram-bot-api';

export const handlePlayersCallback = async (bot: TelegramBot, chatId: number): Promise<void> => {
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
};
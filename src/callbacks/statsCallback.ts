import { HLTVService } from '../services/HLTVService';
import TelegramBot from 'node-telegram-bot-api';

export const handleStatsCallback = async (bot: TelegramBot, chatId: number): Promise<void> => {
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
};
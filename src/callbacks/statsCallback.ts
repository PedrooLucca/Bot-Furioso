import { HLTVService } from '../services/HLTVService';
import TelegramBot from 'node-telegram-bot-api';

// Constantes para mensagens e emojis
const STATS_TITLE = '📊 *Estatísticas dos Jogadores da FURIA* 📊';
const ERROR_MESSAGE = '❌ Não foi possível obter as estatísticas dos jogadores da FURIA.';
const STATS_UNAVAILABLE_MESSAGE = 'Estatísticas indisponíveis.';

// Obtém as estatísticas de um jogador e retorna uma mensagem formatada
const getPlayerStatsMessage = async (player: { id: number; name: string }): Promise<string> => {
    try {
        const stats = await HLTVService.getPlayerStats(player.id);
        return `• *${stats.name}*\n  ${stats.stats}`;
    } catch {
        return `• *${player.name}*\n  ${STATS_UNAVAILABLE_MESSAGE}`;
    }
};

// Lida com o callback para buscar e exibir as estatísticas dos jogadores da FURIA
export const handleStatsCallback = async (bot: TelegramBot, chatId: number): Promise<void> => {
    try {
        // Obtém a lista de jogadores da FURIA
        const players = await HLTVService.getFuriaPlayers();

        // Para cada jogador, busca as estatísticas e trata erros individualmente
        const statsPromises = players.map(getPlayerStatsMessage);

        // Aguarda todas as promessas serem resolvidas
        const statsInfo = await Promise.all(statsPromises);

        // Envia as estatísticas formatadas para o chat
        bot.sendMessage(chatId, `${STATS_TITLE}\n\n${statsInfo.join('\n\n')}`, { parse_mode: 'Markdown' });
    } catch (error) {
        // Loga o erro no console e envia uma mensagem de erro
        console.error('Erro ao buscar estatísticas dos jogadores:', error);
        bot.sendMessage(chatId, ERROR_MESSAGE);
    }
};
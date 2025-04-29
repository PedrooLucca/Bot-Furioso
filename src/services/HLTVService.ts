import HLTV, { MatchPreview, TeamRanking, FullMatchResult } from 'hltv';

export class HLTVService {

    // Método para obter informações dos jogadores da FURIA
    static async getFuriaTeamInfo(): Promise<{ name: string; id: number; players: { name: string; id: number }[] }> {
        const FURIA_TEAM_ID = 8297; // ID da FURIA na HLTV
        try {
            const team = await HLTV.getTeam({ id: FURIA_TEAM_ID });
            return {
                name: team.name,
                id: team.id,
                players: team.players.map(player => ({ name: player.name, id: player.id || 0 })) // Defaulting undefined IDs to 0
            };
        } catch (error) {
            console.error('Erro ao buscar informações da FURIA:', error);
            throw new Error('Não foi possível obter informações da FURIA.');
        }
    }

    static async getFuriaPlayers(): Promise<{ name: string; id: number }[]> {
        try {
            const team = await this.getFuriaTeamInfo();
            return team.players;
        } catch (error) {
            console.error('Erro ao buscar jogadores da FURIA:', error);
            throw new Error('Não foi possível obter informações dos jogadores da FURIA.');
        }
    }

    static async getUpcomingMatches(): Promise<MatchPreview[]> {
        const FURIA_TEAM_ID = 8297; // ID da FURIA na HLTV
        try {
            const matches = await HLTV.getMatches();
            return matches.filter(match => match.team1?.id === FURIA_TEAM_ID || match.team2?.id === FURIA_TEAM_ID);
        } catch (error) {
            console.error('Erro ao buscar próximas partidas:', error);
            throw new Error('Não foi possível obter as próximas partidas.');
        }
    }

    static async getFuriaRanking(): Promise<{ position: number; points: number } | null> {
        try {
            const rankings = await HLTV.getTeamRanking();
            const furiaRanking = rankings.find(team => team.team.name.toLowerCase() === 'furia');

            if (furiaRanking) {
                return {
                    position: furiaRanking.place,
                    points: furiaRanking.points
                };
            }

            return null; // Caso a FURIA não esteja no ranking
        } catch (error) {
            console.error('Erro ao buscar ranking da FURIA:', error);
            throw new Error('Não foi possível obter o ranking da FURIA.');
        }
    }

    static async getFuriaMatchHistory(): Promise<FullMatchResult[]> {
        const FURIA_TEAM_ID = 8297; // ID da FURIA na HLTV
        try {
            const results = await HLTV.getResults({ teamIds: [FURIA_TEAM_ID] });
            if (!results || results.length === 0) {
                console.warn('Nenhum resultado encontrado para a FURIA.');
                return [];
            }
            return results.slice(0, 5); // Retorna os últimos 5 resultados
        } catch (error) {
            console.error('Erro ao buscar histórico de partidas da FURIA:', error);
            throw new Error('Não foi possível obter o histórico de partidas da FURIA.');
        }
    }

    static async getPlayerStats(playerId: number): Promise<{ name: string; stats: string }> {
        try {
            const player = await HLTV.getPlayer({ id: playerId });

            const playerNick = player.ign || 'Desconhecido';

            if (!player.statistics) {
                throw new Error('Estatísticas do jogador não estão disponíveis.');
            }

            const { rating } = player.statistics;

            return {
                name: playerNick,
                stats: `Rating: ${rating}`
            };
        } catch (error) {
            console.error(`Erro ao buscar estatísticas do jogador com ID ${playerId}:`, error);
            throw new Error('Não foi possível obter as estatísticas do jogador.');
        }
    }

}
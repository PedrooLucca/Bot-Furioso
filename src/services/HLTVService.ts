import HLTV, { MatchPreview, TeamRanking, FullMatchResult } from 'hltv';
import CacheService from './CacheService';

export class HLTVService {

    static async getFuriaTeamInfo(): Promise<{ name: string; id: number; players: { name: string; id: number }[] }> {
        const cacheKey = 'furiaTeamInfo';
        const cachedData = CacheService.get<{ name: string; id: number; players: { name: string; id: number }[] }>(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        const FURIA_TEAM_ID = 8297; // ID da FURIA na HLTV
        try {
            const team = await HLTV.getTeam({ id: FURIA_TEAM_ID });
            const teamInfo = {
                name: team.name,
                id: team.id,
                players: team.players.map(player => ({ name: player.name, id: player.id || 0 })) // Defaulting undefined IDs to 0
            };

            CacheService.set(cacheKey, teamInfo); // Cache the data
            return teamInfo;
        } catch (error) {
            console.error('Erro ao buscar informações da FURIA:', error);
            throw new Error('Não foi possível obter informações da FURIA.');
        }
    }

    static async getFuriaPlayers(): Promise<{ name: string; id: number }[]> {
        const cacheKey = 'furiaPlayers';
        const cachedData = CacheService.get<{ name: string; id: number }[]>(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        try {
            const team = await this.getFuriaTeamInfo();
            CacheService.set(cacheKey, team.players); // Cache the data
            return team.players;
        } catch (error) {
            console.error('Erro ao buscar jogadores da FURIA:', error);
            throw new Error('Não foi possível obter informações dos jogadores da FURIA.');
        }
    }

    static async getUpcomingMatches(): Promise<MatchPreview[]> {
        const cacheKey = 'upcomingMatches';
        const cachedData = CacheService.get<MatchPreview[]>(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        const FURIA_TEAM_ID = 8297; // ID da FURIA na HLTV
        try {
            const matches = await HLTV.getMatches();
            const furiaMatches = matches.filter(match => match.team1?.id === FURIA_TEAM_ID || match.team2?.id === FURIA_TEAM_ID);

            CacheService.set(cacheKey, furiaMatches); // Cache the data
            return furiaMatches;
        } catch (error) {
            console.error('Erro ao buscar próximas partidas:', error);
            throw new Error('Não foi possível obter as próximas partidas.');
        }
    }

    static async getFuriaRanking(): Promise<{ position: number; points: number } | null> {
        const cacheKey = 'furiaRanking';
        const cachedData = CacheService.get<{ position: number; points: number } | null>(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        try {
            const rankings = await HLTV.getTeamRanking();
            const furiaRanking = rankings.find(team => team.team.name.toLowerCase() === 'furia');

            if (furiaRanking) {
                const rankingData = {
                    position: furiaRanking.place,
                    points: furiaRanking.points
                };

                CacheService.set(cacheKey, rankingData); // Cache the data
                return rankingData;
            }

            return null; // Caso a FURIA não esteja no ranking
        } catch (error) {
            console.error('Erro ao buscar ranking da FURIA:', error);
            throw new Error('Não foi possível obter o ranking da FURIA.');
        }
    }

    static async getFuriaMatchHistory(): Promise<FullMatchResult[]> {
        const cacheKey = 'furiaMatchHistory';
        const cachedData = CacheService.get<FullMatchResult[]>(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        const FURIA_TEAM_ID = 8297; // ID da FURIA na HLTV
        try {
            const results = await HLTV.getResults({ teamIds: [FURIA_TEAM_ID] });
            if (!results || results.length === 0) {
                console.warn('Nenhum resultado encontrado para a FURIA.');
                return [];
            }

            const matchHistory = results.slice(0, 5); // Retorna os últimos 5 resultados
            CacheService.set(cacheKey, matchHistory); // Cache the data
            return matchHistory;
        } catch (error) {
            console.error('Erro ao buscar histórico de partidas da FURIA:', error);
            throw new Error('Não foi possível obter o histórico de partidas da FURIA.');
        }
    }

    static async getPlayerStats(playerId: number): Promise<{ name: string; stats: string }> {
        const cacheKey = `playerStats_${playerId}`;
        const cachedData = CacheService.get<{ name: string; stats: string }>(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        try {
            const player = await HLTV.getPlayer({ id: playerId });

            const playerNick = player.ign || 'Desconhecido';

            if (!player.statistics) {
                throw new Error('Estatísticas do jogador não estão disponíveis.');
            }

            const { rating } = player.statistics;

            const playerStats = {
                name: playerNick,
                stats: `Rating: ${rating}`
            };

            CacheService.set(cacheKey, playerStats); // Cache the data
            return playerStats;
        } catch (error) {
            console.error(`Erro ao buscar estatísticas do jogador com ID ${playerId}:`, error);
            throw new Error('Não foi possível obter as estatísticas do jogador.');
        }
    }

}
// Importando os módulos e serviços necessários
import HLTV, { MatchPreview, TeamRanking, FullMatchResult } from 'hltv';
import CacheService from './CacheService';
import logger from './LoggerService';

const FURIA_TEAM_ID = 8297; // ID do time FURIA na HLTV
const MAX_MATCH_HISTORY = 5; // Número máximo de partidas no histórico

export type { FullMatchResult };

// Serviço para interagir com a API da HLTV e fornecer dados sobre o time FURIA.
export class HLTVService {

    // Busca informações detalhadas sobre um time na HLTV.
    private static async fetchTeamInfo(teamId: number): Promise<any> {
        return await HLTV.getTeam({ id: teamId });
    }

    // Processa os dados do time para extrair informações relevantes sobre os jogadores.
    private static processTeamPlayers(team: { name: string; id: number; players: { name: string; id?: number }[] }): { name: string; id: number; players: { name: string; id: number }[] } {
        return {
            name: team.name,
            id: team.id,
            players: team.players.map(player => ({ name: player.name, id: player.id || 0 }))
        };
    }

    // Lida com erros, registrando logs e fornecendo contexto.
    private static handleError(error: unknown, context: string): void {
        console.error(`${context}:`, error);
        if (error instanceof Error) {
            logger.error(`${context}: ${error.message}`);
        } else {
            logger.error(`${context}: Erro desconhecido`);
        }
    }

    // Recupera informações sobre o time FURIA, incluindo seus jogadores.
    static async getFuriaTeamInfo(): Promise<{ name: string; id: number; players: { name: string; id: number }[] }> {
        const cacheKey = 'furiaTeamInfo';
        const cachedData = CacheService.get<{ name: string; id: number; players: { name: string; id: number }[] }>(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        try {
            const team = await this.fetchTeamInfo(FURIA_TEAM_ID);
            const teamInfo = this.processTeamPlayers(team);
            CacheService.set(cacheKey, teamInfo);
            return teamInfo;
        } catch (error) {
            this.handleError(error, 'Erro ao buscar informações do time FURIA');
            throw new Error('Não foi possível obter informações do time FURIA.');
        }
    }

    // Recupera o histórico de partidas do time FURIA.
    static async getFuriaMatchHistory(): Promise<FullMatchResult[]> {
        const cacheKey = 'furiaMatchHistory';
        const cachedData = CacheService.get<FullMatchResult[]>(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        try {
            const results = await HLTV.getResults({ teamIds: [FURIA_TEAM_ID] });
            if (!results || results.length === 0) {
                console.warn('Nenhum resultado encontrado para o time FURIA.');
                return [];
            }

            const matchHistory = results.slice(0, MAX_MATCH_HISTORY);
            CacheService.set(cacheKey, matchHistory);
            return matchHistory;
        } catch (error) {
            this.handleError(error, 'Erro ao buscar histórico de partidas do time FURIA');
            throw new Error('Não foi possível obter o histórico de partidas do time FURIA.');
        }
    }

    // Recupera a lista de jogadores do time FURIA.
    static async getFuriaPlayers(): Promise<{ name: string; id: number }[]> {
        const cacheKey = 'furiaPlayers';
        const cachedData = CacheService.get<{ name: string; id: number }[]>(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        try {
            const team = await this.getFuriaTeamInfo();
            CacheService.set(cacheKey, team.players);
            return team.players;
        } catch (error) {
            this.handleError(error, 'Erro ao buscar jogadores do time FURIA');
            throw new Error('Não foi possível obter os jogadores do time FURIA.');
        }
    }

    // Recupera as próximas partidas envolvendo o time FURIA.
    static async getUpcomingMatches(): Promise<MatchPreview[]> {
        const cacheKey = 'upcomingMatches';
        const cachedData = CacheService.get<MatchPreview[]>(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        try {
            const matches = await HLTV.getMatches();
            const furiaMatches = matches.filter(match => match.team1?.id === FURIA_TEAM_ID || match.team2?.id === FURIA_TEAM_ID);

            CacheService.set(cacheKey, furiaMatches);
            return furiaMatches;
        } catch (error) {
            this.handleError(error, 'Erro ao buscar próximas partidas');
            throw new Error('Não foi possível obter as próximas partidas.');
        }
    }

    // Recupera o ranking atual do time FURIA.
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

                CacheService.set(cacheKey, rankingData);
                return rankingData;
            }

            return null;
        } catch (error) {
            this.handleError(error, 'Erro ao buscar ranking do time FURIA');
            throw new Error('Não foi possível obter o ranking do time FURIA.');
        }
    }

    // Recupera estatísticas de um jogador específico pelo ID.
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

            CacheService.set(cacheKey, playerStats);
            return playerStats;
        } catch (error) {
            this.handleError(error, `Erro ao buscar estatísticas do jogador com ID ${playerId}`);
            throw new Error('Não foi possível obter as estatísticas do jogador.');
        }
    }

}
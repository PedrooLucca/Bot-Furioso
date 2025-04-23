import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // Cache por 1 hora

interface Match {
    event: string;
    team1: string;
    team2: string;
    date: Date;
    map?: string;
}

interface TeamRanking {
    position: number;
    team: string;
    points: number;
}

export class HLTVService {
    private readonly API_BASE = 'https://hltv-api.vercel.app/api';

    async getNextMatches(): Promise<Match[]> {
        const cacheKey = 'next_matches';
        const cached = cache.get<Match[]>(cacheKey);
        
        if (cached) return cached;

        try {
            const response = await axios.get(`${this.API_BASE}/matches.json`);
            const matches = response.data.filter((match: any) => 
                match.team1.toLowerCase().includes('furia') || 
                match.team2.toLowerCase().includes('furia')
            );
            
            cache.set(cacheKey, matches);
            return matches;
        } catch (error) {
            console.error('Erro ao buscar partidas:', error);
            return [];
        }
    }

    async getTeamRanking(): Promise<TeamRanking[]> {
        const cacheKey = 'team_ranking';
        const cached = cache.get<TeamRanking[]>(cacheKey);
        
        if (cached) return cached;

        try {
            const response = await axios.get(`${this.API_BASE}/ranking.json`);
            cache.set(cacheKey, response.data);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar ranking:', error);
            return [];
        }
    }
}

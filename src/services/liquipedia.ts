import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 7200 }); // Cache por 2 horas

interface PlayerInfo {
    nickname: string;
    fullName: string;
    role: string;
    country: string;
}

export class LiquipediaService {
    private readonly API_BASE = 'https://liquipedia.net/counterstrike/api.php';

    async getTeamInfo(): Promise<PlayerInfo[]> {
        const cacheKey = 'furia_team_info';
        const cached = cache.get<PlayerInfo[]>(cacheKey);
        
        if (cached) return cached;

        try {
            const response = await axios.get(this.API_BASE, {
                params: {
                    action: 'parse',
                    page: 'FURIA_Esports',
                    format: 'json',
                    prop: 'text'
                },
                headers: {
                    'User-Agent': 'FuriaFanBot/1.0 (pedrolfo2911@gmail.com)'
                }
            });

            // Processar os dados aqui
            const players: PlayerInfo[] = []; // Implementar parser
            cache.set(cacheKey, players);
            return players;
        } catch (error) {
            console.error('Erro ao buscar informações do time:', error);
            return [];
        }
    }
}

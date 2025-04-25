import HLTV, { FullTeam } from 'hltv';

export class HLTVService {
    static async getFuriaTeamInfo(): Promise<{ name: string; id: number; players: { name: string; id: number }[] }> {
        const FURIA_TEAM_ID = 8297; // ID da FURIA na HLTV
        try {
            const team: FullTeam = await HLTV.getTeam({ id: FURIA_TEAM_ID });
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
}
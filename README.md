# 📘 Visão Geral do Projeto

O projeto **BOT Furioso** é um bot do Telegram desenvolvido para fãs do time de CS da FURIA. Ele fornece informações como jogadores, próximas partidas, ranking mundial, histórico de partidas e estatísticas. O público-alvo são fãs da FURIA que desejam acompanhar as atualizações de forma prática.

### Tecnologias Utilizadas
- **Node.js**: Ambiente de execução para JavaScript.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
- **node-telegram-bot-api**: Biblioteca para integração com a API do Telegram.
- **HLTV**: Biblioteca para acessar dados do site HLTV.org.
- **node-cache**: Implementação de cache em memória.
- **Jest**: Framework de testes para JavaScript e TypeScript.

# 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos para Instalação
1. Clone o repositório:
   ```bash
   git clone https://github.com/PedrooLucca/Desafio1-Furia-telegram.git
   cd Desafio1-Furia-telegram
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
     ```env
     BOT_TOKEN=<SEU_TOKEN_DO_TELEGRAM>
     ```

### Rodando o Projeto Localmente
- Para iniciar o bot em modo de desenvolvimento:
  ```bash
  npm run dev
  ```
- Para iniciar o bot em produção:
  ```bash
  npm start
  ```

# 🧠 Estrutura do Projeto

A arquitetura do projeto é organizada da seguinte forma:

```
src/
  bot/                # Arquivo principal do bot
  callbacks/          # Callbacks para comandos do Telegram
  services/           # Serviços auxiliares (ex: Logger, HLTV, Cache)
__tests__/            # Testes automatizados
```

### Separação de Responsabilidades
- **bot/index.ts**: Ponto de entrada do bot, gerencia comandos e callbacks.
- **callbacks/**: Contém funções que tratam as interações do usuário com o bot.
- **services/**: Implementa lógica de negócios, como integração com HLTV e cache.
- **__tests__/**: Contém testes unitários e de integração.

# 📦 Cache e Performance

O projeto utiliza a biblioteca **node-cache** para melhorar a performance, armazenando dados frequentemente acessados em memória. Exemplos de dados armazenados em cache:
- Informações do time FURIA (jogadores, ID, etc.).
- Próximas partidas.
- Ranking mundial.

# 🧪 Testes Automatizados

Os testes foram implementados usando **Jest** e estão localizados na pasta `__tests__/`.

### Rodando os Testes
- Para executar todos os testes:
  ```bash
  npm test
  ```

# 💬 Integração com Telegram

O bot utiliza a biblioteca **node-telegram-bot-api** para interagir com a API do Telegram. Os callbacks são responsáveis por tratar os comandos enviados pelos usuários.

### Exemplos de Comandos Suportados
- `/start`: Exibe o menu inicial com opções interativas.
- `Jogadores`: Lista os jogadores do time FURIA.
- `Próximas Partidas`: Mostra as próximas partidas agendadas.
- `Ranking Mundial`: Exibe a posição da FURIA no ranking mundial.
- `Histórico de Partidas`: Mostra os últimos resultados da FURIA.
- `Estatísticas`: Exibe estatísticas dos jogadores.

# 🛠️ Scripts Úteis

- `npm start`: Inicia o bot em produção.
- `npm run dev`: Inicia o bot em modo de desenvolvimento com `nodemon`.
- `npm test`: Executa os testes automatizados.
- `npm run build`: Compila o projeto TypeScript para JavaScript.
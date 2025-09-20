# MyMoviesRN

App Android feito em React Native que consome a API do TMDb para listar filmes populares, permitir busca e deixar o usuário controlar o que já viu ou pretende ver.
## Funcionalidades principais
- Lista filmes populares do TMDb com paginação infinita e estado de carregamento dedicado para novas páginas.
- Busca com debounce, prevenção de condições de corrida e mensagens de feedback quando não há resultados ou ocorre erro.
- Marcação de filmes como "Assistido" ou "Quero ver", com persistência local via AsyncStorage.
- Agendamento de horários com opção de criar eventos no calendário do dispositivo usando `expo-calendar` e modal dedicado para ajustar data e hora.
- Tela "Meus filmes" com resumo das estatísticas pessoais e listas separadas por status (assistidos, quero assistir, agendados).

## Pré-requisitos
- Node.js 18 ou superior.
- npm 9 ou superior.
- Uma conta no [TMDb](https://www.themoviedb.org/) para gerar a chave de API.

## Configuração do ambiente
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie o arquivo de exemplo e informe a chave do TMDb:
   ```bash
   cp .env.example .env
   ```
3. Edite `.env` e defina `TMDB_API_KEY` com a chave criada no painel do TMDb.

## Execução
- Iniciar o bundler Expo:
  ```bash
  npm run start
  ```
- Abrir diretamente em um dispositivo ou emulador:
  ```bash
  npm run android
  ```
## Estrutura do projeto
```
src/
  components/     # Cartões de filmes, modal de agendamento, barra de busca e estados vazios
  context/        # Contexto global com persistência, agendamentos e integração com calendário
  screens/        # Telas de catálogo e gerenciamento pessoal
  services/       # Cliente TMDb e mapeamento dos dados
  theme/          # Paleta de cores, espaçamentos e raios padrão
  utils/          # Formatação de datas e sinopses
```

## Integrações e comportamento
- A API do TMDb é consumida via Axios; o idioma padrão das requisições é `pt-BR` e a chave vem das variáveis de ambiente.
- Os registros pessoais são guardados no dispositivo com AsyncStorage e mantêm apenas filmes marcados, desejados ou agendados.
- A criação e remoção de eventos no calendário depende de permissão do usuário; no ambiente web o app mantém o lembrete apenas localmente.

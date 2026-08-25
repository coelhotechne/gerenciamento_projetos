# Techne — Dashboard de Gerenciamento de Aplicações

Dashboard em React para gerenciar um portfólio de aplicações: catálogo, usuários e
permissões (RBAC), assinaturas/licenciamento e monitoramento. Hoje roda 100% com
dados simulados (mock) no navegador; foi construído para ser plugado, sem
reescrever telas, à API real que você vai derivar do `erp_saas_storage`.

## Rodando o projeto

```bash
npm install
npm start
```

Abre em `http://localhost:3000`. Na tela de login, use uma das **contas de
demonstração** (Ana, Bruno, Carla, Diego) para entrar já autenticado com um
papel diferente — não é preciso senha real, é tudo mock.

## Papéis (RBAC)

| Papel | Pode |
|---|---|
| **Proprietário** | Tudo, incluindo faturamento e exclusão de aplicações |
| **Administrador** | Aplicações, usuários e permissões (sem faturamento) |
| **Desenvolvedor** | Aplicações e chaves de API; usuários somente leitura |
| **Visualizador** | Somente leitura nas áreas liberadas para o seu perfil |

A matriz completa fica em `src/auth/permissions.js`. Toda tela e toda ação
sensível consultam `hasPermission()` (via `useAuth()`), nunca o papel bruto —
então trocar a origem das permissões (ex.: vir de claims do JWT real) não
exige tocar em nenhum componente de UI.

Alguns pontos de segurança que já estão implementados na interface, para você
espelhar na API real:

- **Log de auditoria de exemplo** e **redação de dados sensíveis** — usuários
  sem a permissão `logs:view:full` veem IP e user-agent ocultos na tela de
  Monitoramento (em produção essa redação deve acontecer no servidor, não só
  no cliente).
- **Revelação única de chave de API** — a chave completa só aparece uma vez,
  no momento da criação; depois disso, só o prefixo fica visível.
- **Token de acesso em memória** — o JWT não é salvo em `localStorage`
  (vulnerável a XSS). Ele vive apenas no estado do React; a persistência de
  sessão entre recarregamentos deveria vir de um refresh token em cookie
  `httpOnly` controlado pelo backend.

## Estrutura

```
src/
├── api/            serviços que hoje leem dos mocks, mas já têm a forma de
│                   chamadas HTTP reais (ver "Ligando a API real" abaixo)
├── auth/           contexto de autenticação + matriz de permissões (RBAC)
├── components/     peças reutilizáveis (tabela, badge, modal, drawer…)
├── layouts/         casca do dashboard (sidebar + topbar)
├── mocks/          dados simulados usados por todos os serviços
├── pages/          telas: Visão Geral, Aplicações, Usuários, Assinaturas, Monitoramento
├── routes/         guards de rota (autenticação e permissão)
└── utils/          formatação (datas, moeda) e mapas de rótulo/status
```

## Ligando a API real

Cada arquivo em `src/api/*Service.js` concentra toda a lógica de acesso a
dados de um domínio (aplicações, usuários, assinaturas, monitoramento,
autenticação). Hoje eles leem de `src/mocks/mockData.js`; quando a sua API
existir:

1. Crie um `.env.local` com `REACT_APP_API_URL=https://sua-api.com/api/v1`
   (o cliente axios em `src/api/httpClient.js` já lê essa variável).
2. Em cada `*Service.js`, troque o corpo das funções pela chamada
   equivalente em `httpClient` (`httpClient.get("/applications")`, etc.),
   mantendo a mesma assinatura de função e o mesmo formato de retorno — as
   telas não precisam mudar.
3. Em `src/api/authService.js`, troque `login`/`refresh`/`logout` para
   chamar `POST /auth/login`, `POST /auth/refresh` e `POST /auth/logout` na
   sua API. O contrato esperado de `login` é:
   `{ user: { id, name, email, role, status }, accessToken, expiresAt }`.
4. Garanta que a API já devolva os dados **redigidos por permissão** (IP,
   user-agent, chaves completas) em vez de confiar só na redação do cliente.

Nenhuma tela precisa ser reescrita nesse processo — só a implementação por
trás de cada função de serviço.

## Próximos passos sugeridos

- Adaptar o schema do `erp_saas_storage` para as entidades daqui: aplicação,
  usuário/permissão, assinatura, log/alerta.
- Implementar emissão real de JWT com claims de papel no backend.
- Adicionar testes (o projeto já vem com Testing Library configurada).

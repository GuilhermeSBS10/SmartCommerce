# ![Logo do SmartCommerce](.Projeto de React/img/LogoSmartCommerce.png) SmartCommerce

SmartCommerce e uma plataforma de controle financeiro pessoal com foco em clareza, organizacao e experiencia moderna. O projeto combina um frontend em React com um backend em Spring Boot para acompanhar saldo, transacoes, cofrinhos, metas financeiras, perfil do usuario e configuracoes da conta.

## Visao Geral

O projeto foi desenhado para entregar uma experiencia completa de organizacao financeira:

- dashboard com saldo total, saldo disponivel, valores guardados e insights
- transacoes com filtros por periodo, categoria e tipo
- cofrinhos com deposito, retirada e calculo de progresso
- perfil, seguranca da conta e configuracoes do sistema
- experiencia responsiva e fluxo de autenticacao com feedback visual

## Stack

- Frontend: React, Vite, CSS Modules, React Router, Axios, Recharts, jsPDF
- Backend: Spring Boot, validacao Jakarta, arquitetura preparada para SQL
- Banco de dados: estrutura preparada para MySQL + Flyway

## Estrutura

### Frontend

- `App.jsx`: roteamento principal
- `DashboardPage.jsx`: painel financeiro e graficos
- `TransacoesPage.jsx`: listagem, filtros e exportacao
- `ProfilePage.jsx`: perfil e seguranca da conta
- `SettingsPage.jsx`: tema e preferencias gerais

### Backend

- `AuthController`: autenticacao e recuperacao de senha
- `TransactionController`: CRUD e dashboard
- `GoalController`: cofrinhos e movimentacoes
- `UserController`: perfil, preferencias e seguranca
- `persistence/`: contratos de persistencia prontos para implementacao SQL

## Estado Atual da Persistencia

O armazenamento local em JSON foi removido para abrir caminho para a implementacao do banco de dados real.

Hoje o backend esta com:

- contratos de persistencia separados da regra de negocio
- placeholders ativos para impedir uso de armazenamento local
- estrutura pronta para o dev responsavel plugar MySQL com Flyway

O guia tecnico dessa etapa esta em [README-BANCO-DE-DADOS.md](./README-BANCO-DE-DADOS.md).

## Como Rodar o Frontend

```bash
npm install
npm run dev
```

Aplicacao disponivel em `http://localhost:5173`.

## Como Rodar o Backend

```bash
cd "/Users/guisbs/Desktop/Projeto-Financeiro-Backend-main/financeiro"
./mvnw spring-boot:run
```

Observacao importante:

- o backend esta preparado para SQL, mas a camada real do banco ainda precisa ser implementada
- enquanto os placeholders estiverem ativos, operacoes de persistencia retornarao erro controlado

## Proximos Passos

- implementar entidades JPA e repositórios SQL
- criar migrations Flyway
- ligar MySQL via variaveis de ambiente
- substituir os placeholders pelas implementacoes reais de persistencia

## Documentacao Tecnica

- guia do projeto: `README.md`
- guia para banco de dados: [README-BANCO-DE-DADOS.md](./README-BANCO-DE-DADOS.md)

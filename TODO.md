# TODO: Sistema de Controle de Tanque de Camarão

## Backend Setup
- [x] Criar estrutura de pastas: auth-system/backend e auth-system/frontend
- [x] Inicializar projeto Node.js no backend
- [x] Instalar dependências: express, mongoose, bcryptjs, jsonwebtoken, nodemailer, cors, dotenv
- [x] Criar modelo User (username, email, password)
- [x] Criar rotas de autenticação: register, login, forgot-password
- [x] Criar middleware de autenticação
- [x] Configurar serviço de e-mail com nodemailer
- [x] Criar server.js principal

## Frontend Setup
- [x] Criar app React com Vite
- [x] Instalar dependências: react-router-dom, axios, tailwindcss
- [x] Criar componentes: Login, Register, ForgotPassword, Dashboard
- [x] Implementar lógica de formulários e chamadas API
- [x] Configurar roteamento
- [x] Estilizar com Tailwind CSS

## Sistema de Controle de Tanque
- [ ] Criar modelo TankData (ph, temperature, oxygenation, inspectionDate, feedingDate, responsible)
- [ ] Criar rotas API para CRUD dos dados do tanque
- [ ] Atualizar dashboard com gráficos (Chart.js ou Recharts)
- [ ] Criar componente para cadastro de dados do tanque
- [ ] Criar componente para listagem/visualização dos dados
- [ ] Adicionar navegação entre seções
- [ ] Implementar filtros e busca nos dados

## Testing
- [ ] Testar funcionalidades: registro, login, recuperação de senha
- [ ] Testar cadastro e visualização de dados do tanque
- [ ] Verificar gráficos e dashboard
- [ ] Testar responsividade

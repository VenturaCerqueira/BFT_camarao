# Auth System

Um sistema completo de autenticação com frontend em React e backend em Node.js.

## Funcionalidades

- Registro de usuários
- Login de usuários
- Recuperação de senha
- Autenticação JWT
- Design responsivo

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## Instalação

1. Clone o repositório:
   ```
   git clone <url-do-repositorio>
   cd auth-system
   ```

2. Instale as dependências do backend:
   ```
   cd backend
   npm install
   ```

3. Instale as dependências do frontend:
   ```
   cd ../frontend
   npm install
   ```

## Executando o Projeto

1. Inicie o servidor backend:
   ```
   cd backend
   npm run dev
   ```
   O backend será executado em http://localhost:5000

2. Inicie o servidor frontend:
   ```
   cd frontend
   npm run dev
   ```
   O frontend será executado em http://localhost:3000 (ou a porta atribuída pelo Vite)

## Uso

- Acesse a aplicação em http://localhost:3000
- Registre uma nova conta
- Faça login com suas credenciais
- Acesse o dashboard

## Estrutura do Projeto

- `backend/` - Servidor Node.js/Express
- `frontend/` - Aplicação React com Vite

## Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- MongoDB (ou outro banco de dados)
- JWT para autenticação
- bcrypt para hash de senhas

### Frontend
- React
- Vite
- Tailwind CSS
- Axios para requisições HTTP
- React Router para navegação

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.

# Passos para Deploy no Netlify

## 1. Preparação Inicial
- [ ] Verificar se você tem conta no Netlify (se não, criar em netlify.com)
- [ ] Verificar se você tem conta no MongoDB Atlas (se não, criar em mongodb.com/atlas)
- [ ] Instalar Netlify CLI: `npm install -g netlify-cli`

## 2. Configurar MongoDB Atlas
- [ ] Criar cluster no MongoDB Atlas
- [ ] Obter connection string e configurar variáveis de ambiente

## 3. Modificar Backend para Netlify Functions
- [ ] Criar pasta `netlify/functions` no diretório raiz
- [ ] Converter rotas do Express para funções serverless
- [ ] Configurar `netlify.toml` para build e functions

## 4. Configurar Frontend
- [ ] Atualizar URLs do backend no frontend para usar `/api/` (que será redirecionado para functions)
- [ ] Configurar build do Vite para produção

## 5. Deploy
- [ ] Fazer commit das mudanças no Git
- [ ] Conectar repositório ao Netlify
- [ ] Configurar variáveis de ambiente no Netlify
- [ ] Deploy do site

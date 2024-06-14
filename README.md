
# 🏓 Pong Game

Este é um simples jogo multiplayer de Pong desenvolvido para aprendizado e demonstração. O jogo utiliza Node.js, Express e Socket.io para comunicação em tempo real entre os jogadores.

## 📜 Sumário

- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Reproduzir](#como-reproduzir)
- [Descontinuado](#descontinuado)

## 🛠️ Funcionalidades

- 🎮 Jogo multiplayer de Pong
- 📶 Comunicação em tempo real usando WebSockets
- 📊 Placar para cada jogador
- ⏳ Contagem regressiva para o início do jogo
- 🕹️ Suporte para controle por mouse e toque

## 📁 Estrutura do Projeto

```plaintext
/public
  ├── index.html
  ├── css
  │   └── styles.css
  ├── js
  │   ├── game.js
  │   ├── socket.js
  │   ├── ui.js
  │   └── paddle.js
/server
  ├── gameLogic.js
  ├── server.js
  └── utils.js
```

- **server.js:** Código principal do servidor.
- **gameLogic.js:** Lógica do jogo no servidor.
- **utils.js:** Funções utilitárias.
- **index.html:** Estrutura da página HTML.
- **styles.css:** Estilos CSS.
- **game.js:** Lógica principal do jogo no cliente.
- **socket.js:** Comunicação via WebSockets.
- **paddle.js:** Lógica das raquetes.
- **ui.js:** Interface do usuário.

## 🖥️ Como Reproduzir

### Pré-requisitos

- Node.js instalado
- NPM (Node Package Manager) instalado

### Passos

1. Clone o repositório:
   ```sh
   git clone https://github.com/arthr/pingpong.git
   ```

2. Navegue até o diretório do projeto:
   ```sh
   cd pingpong
   ```

3. Instale as dependências:
   ```sh
   npm install
   ```

4. Inicie o servidor:
   ```sh
   npm start
   ```

5. Abra o navegador e acesse:
   ```
   http://localhost:3000
   ```

## ❌ Descontinuado

Este projeto foi descontinuado para iniciar um novo utilizando recursos mais avançados. 🎉

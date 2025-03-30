# Solana Token Manager

A React application for creating and managing Solana tokens on the devnet network.

## Features

- Connect to Solana wallet (Phantom or Solflare)
- Create new SPL tokens
- Mint tokens to your wallet
- Modern and responsive UI
- Real-time transaction feedback

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A Solana wallet (Phantom or Solflare) installed in your browser

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd solana-token-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Connect your wallet using the "Connect Wallet" button in the top-right corner
2. Create a new token by filling in the token details and clicking "Create Token"
3. Once the token is created, you can mint additional tokens using the "Mint Tokens" button
4. All transactions will be performed on the Solana devnet network

## Development

- Built with React and TypeScript
- Uses Material-UI for the user interface
- Integrates with Solana Web3.js and SPL Token program
- State management with React hooks

## Dependencies

- @solana/web3.js
- @solana/spl-token
- @solana/wallet-adapter-react
- @solana/wallet-adapter-wallets
- @mui/material
- react-toastify

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

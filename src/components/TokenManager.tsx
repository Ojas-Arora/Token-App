import { FC, useState, ChangeEvent } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress, createMint, createAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';

export const TokenManager: FC = () => {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [decimals, setDecimals] = useState('9');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenMint, setTokenMint] = useState('');
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  const handleCreateToken = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      toast.info('Creating token...');
      
      // Create new token mint
      const mintKeypair = Keypair.generate();
      
      // Create token with specified decimals
      const mint = await createMint(
        connection,
        mintKeypair,
        publicKey,
        publicKey,
        Number(decimals)
      );

      setTokenMint(mint.toBase58());
      toast.success(`Token created successfully! Mint address: ${mint.toBase58()}`);
    } catch (error) {
      console.error('Error creating token:', error);
      toast.error('Failed to create token');
    } finally {
      setLoading(false);
    }
  };

  const handleMintTokens = async () => {
    if (!publicKey || !tokenMint) {
      toast.error('Please connect your wallet and create a token first');
      return;
    }

    try {
      setLoading(true);
      toast.info('Minting tokens...');
      
      // Get or create associated token account
      const associatedTokenAddress = await getAssociatedTokenAddress(
        new PublicKey(tokenMint),
        publicKey
      );

      // Create the token account if it doesn't exist
      try {
        const payer = Keypair.generate();
        await createAssociatedTokenAccount(
          connection,
          payer,
          new PublicKey(tokenMint),
          publicKey
        );
      } catch (error) {
        // Ignore error if account already exists
        if (error instanceof Error && !error.message.includes('already in use')) {
          throw error;
        }
      }

      // Mint tokens
      const mintAmount = Number(amount) * Math.pow(10, Number(decimals));
      const transaction = new Transaction().add(
        mintTo(
          TOKEN_PROGRAM_ID,
          new PublicKey(tokenMint),
          associatedTokenAddress,
          publicKey,
          [],
          mintAmount
        )
      );

      // Get the latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign and send transaction
      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      toast.success(`Tokens minted successfully! Transaction: ${signature}`);
    } catch (error) {
      console.error('Error minting tokens:', error);
      toast.error('Failed to mint tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter: (value: string) => void) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setter(e.target.value);
  };

  return (
    <Paper sx={{ p: 4, mt: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 4 }}>
        Create and Mint Tokens
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="Token Name"
          value={tokenName}
          onChange={handleInputChange(setTokenName)}
          fullWidth
          variant="outlined"
        />
        
        <TextField
          label="Token Symbol"
          value={tokenSymbol}
          onChange={handleInputChange(setTokenSymbol)}
          fullWidth
          variant="outlined"
        />
        
        <TextField
          label="Decimals"
          type="number"
          value={decimals}
          onChange={handleInputChange(setDecimals)}
          fullWidth
          variant="outlined"
        />
        
        <TextField
          label="Amount to Mint"
          type="number"
          value={amount}
          onChange={handleInputChange(setAmount)}
          fullWidth
          variant="outlined"
          disabled={!tokenMint}
        />
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleCreateToken}
            disabled={loading || !publicKey}
            sx={{ minWidth: 150 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Token'}
          </Button>
          
          <Button
            variant="contained"
            onClick={handleMintTokens}
            disabled={loading || !tokenMint || !publicKey}
            sx={{ minWidth: 150 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Mint Tokens'}
          </Button>
        </Box>
        
        {tokenMint && (
          <Typography variant="body2" color="text.secondary" align="center">
            Token Mint Address: {tokenMint}
          </Typography>
        )}

        {!publicKey && (
          <Typography variant="body2" color="error" align="center">
            Please connect your wallet to create and mint tokens
          </Typography>
        )}
      </Box>
    </Paper>
  );
}; 
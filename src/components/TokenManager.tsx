import { FC, useState, ChangeEvent, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, Keypair, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccount, TOKEN_PROGRAM_ID, getAccount, MINT_SIZE, createInitializeMintInstruction, createMintToInstruction } from '@solana/spl-token';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import { toast } from 'react-toastify';

export const TokenManager: FC = () => {
  const theme = useTheme();
  const wallet = useWallet();
  const { publicKey, signTransaction } = wallet;
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [decimals, setDecimals] = useState('9');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenMint, setTokenMint] = useState('');
  const [mintKeypair, setMintKeypair] = useState<Keypair | null>(null);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  // Update toast styles
  const toastStyle = {
    background: theme.palette.mode === 'dark' ? '#1E1E1E' : '#FFFFFF',
    color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  };

  // Fetch SOL balance
  useEffect(() => {
    if (publicKey) {
      const fetchBalance = async () => {
        try {
          const balance = await connection.getBalance(publicKey);
          setSolBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error('Error fetching SOL balance:', error);
        }
      };
      fetchBalance();
      const interval = setInterval(fetchBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [publicKey, connection]);

  // Fetch token balance
  useEffect(() => {
    if (publicKey && tokenMint) {
      const fetchTokenBalance = async () => {
        try {
          const associatedTokenAddress = await getAssociatedTokenAddress(
            new PublicKey(tokenMint),
            publicKey
          );
          const account = await getAccount(connection, associatedTokenAddress);
          setTokenBalance(Number(account.amount) / Math.pow(10, Number(decimals)));
        } catch (error) {
          console.error('Error fetching token balance:', error);
        }
      };
      fetchTokenBalance();
      const interval = setInterval(fetchTokenBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [publicKey, tokenMint, connection, decimals]);

  const handleCreateToken = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet first', { style: toastStyle });
      return;
    }

    if (!tokenName || !tokenSymbol) {
      toast.error('Please enter token name and symbol', { style: toastStyle });
      return;
    }

    try {
      setLoading(true);
      toast.info('Creating token...', { style: toastStyle });
      
      // Create new token mint
      const newMintKeypair = Keypair.generate();
      const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
      
      // Create transaction
      const transaction = new Transaction();
      
      // Add system program instruction to create mint account
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: newMintKeypair.publicKey,
          lamports,
          space: MINT_SIZE,
          programId: TOKEN_PROGRAM_ID,
        })
      );

      // Add initialize mint instruction
      transaction.add(
        createInitializeMintInstruction(
          newMintKeypair.publicKey,
          Number(decimals),
          publicKey,
          publicKey,
          TOKEN_PROGRAM_ID
        )
      );

      // Get latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign transaction with both the wallet and mint keypair
      const signed = await signTransaction(transaction);
      signed.partialSign(newMintKeypair);
      
      const signature = await connection.sendRawTransaction(signed.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature);

      setTokenMint(newMintKeypair.publicKey.toBase58());
      setMintKeypair(newMintKeypair);
      toast.success(`Token created successfully! Mint address: ${newMintKeypair.publicKey.toBase58()}`, { style: toastStyle });
    } catch (error) {
      console.error('Error creating token:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create token', { style: toastStyle });
    } finally {
      setLoading(false);
    }
  };

  const handleMintTokens = async () => {
    if (!publicKey || !signTransaction || !tokenMint || !mintKeypair) {
      toast.error('Please connect your wallet and create a token first', { style: toastStyle });
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount', { style: toastStyle });
      return;
    }

    try {
      setLoading(true);
      toast.info('Minting tokens...', { style: toastStyle });
      
      // Get or create associated token account
      const associatedTokenAddress = await getAssociatedTokenAddress(
        new PublicKey(tokenMint),
        publicKey
      );

      // Create the token account if it doesn't exist
      try {
        await createAssociatedTokenAccount(
          connection,
          {
            publicKey: publicKey,
            secretKey: new Uint8Array(64)
          },
          new PublicKey(tokenMint),
          publicKey
        );
      } catch (error) {
        if (error instanceof Error && !error.message.includes('already in use')) {
          throw error;
        }
      }

      // Create mint instruction
      const mintAmount = BigInt(Number(amount) * Math.pow(10, Number(decimals)));
      const mintInstruction = createMintToInstruction(
        new PublicKey(tokenMint),
        associatedTokenAddress,
        publicKey,
        mintAmount
      );

      // Create and sign transaction
      const transaction = new Transaction().add(mintInstruction);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign with wallet first, then mint keypair
      const signed = await signTransaction(transaction);
      signed.partialSign(mintKeypair);
      
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      toast.success(`Tokens minted successfully! Transaction: ${signature}`, { style: toastStyle });
    } catch (error) {
      console.error('Error minting tokens:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to mint tokens', { style: toastStyle });
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
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Grid container spacing={3}>
        {/* Wallet Info Card */}
        <Grid item xs={12}>
          <Card 
            sx={{ 
              background: 'linear-gradient(45deg, #00BCD4 30%, #006064 90%)',
              color: '#ffffff',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 188, 212, 0.2)',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Wallet Information
              </Typography>
              {publicKey ? (
                <>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Address: {publicKey.toBase58()}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    SOL Balance: {solBalance.toFixed(4)} SOL
                  </Typography>
                  {tokenMint && (
                    <Typography variant="body2">
                      Token Balance: {tokenBalance.toFixed(4)} {tokenSymbol}
                    </Typography>
                  )}
                </>
              ) : (
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Please connect your wallet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Token Creation Form */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: { xs: 2, sm: 4 },
              borderRadius: 3,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #1E1E1E 30%, #2A2A2A 90%)'
                : 'linear-gradient(45deg, #FFFFFF 30%, #F5F5F5 90%)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom 
              align="center" 
              sx={{ 
                mb: 4,
                fontWeight: 600,
                background: 'linear-gradient(45deg, #00BCD4 30%, #006064 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Create Token
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Token Name"
                value={tokenName}
                onChange={handleInputChange(setTokenName)}
                fullWidth
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#00BCD4',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00BCD4',
                    },
                    '& input': {
                      color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
                    },
                    '& label': {
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    },
                  },
                }}
              />
              
              <TextField
                label="Token Symbol"
                value={tokenSymbol}
                onChange={handleInputChange(setTokenSymbol)}
                fullWidth
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#00BCD4',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00BCD4',
                    },
                    '& input': {
                      color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
                    },
                    '& label': {
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    },
                  },
                }}
              />
              
              <TextField
                label="Decimals"
                type="number"
                value={decimals}
                onChange={handleInputChange(setDecimals)}
                fullWidth
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#00BCD4',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00BCD4',
                    },
                    '& input': {
                      color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
                    },
                    '& label': {
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    },
                  },
                }}
              />
              
              <Button
                variant="contained"
                onClick={handleCreateToken}
                disabled={loading || !publicKey || !tokenName || !tokenSymbol}
                sx={{ 
                  minWidth: 150,
                  height: 48,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #00BCD4 30%, #006064 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #0097A7 30%, #004D40 90%)',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 188, 212, 0.5)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#ffffff' }} />
                ) : (
                  'Create Token'
                )}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Token Minting Form */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: { xs: 2, sm: 4 },
              borderRadius: 3,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #1E1E1E 30%, #2A2A2A 90%)'
                : 'linear-gradient(45deg, #FFFFFF 30%, #F5F5F5 90%)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom 
              align="center" 
              sx={{ 
                mb: 4,
                fontWeight: 600,
                background: 'linear-gradient(45deg, #00BCD4 30%, #006064 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Mint Tokens
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Amount"
                type="number"
                value={amount}
                onChange={handleInputChange(setAmount)}
                fullWidth
                variant="outlined"
                required
                disabled={!tokenMint}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#00BCD4',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00BCD4',
                    },
                    '& input': {
                      color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
                    },
                    '& label': {
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    },
                  },
                }}
              />
              
              <Button
                variant="contained"
                onClick={handleMintTokens}
                disabled={loading || !publicKey || !tokenMint || !amount}
                sx={{ 
                  minWidth: 150,
                  height: 48,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #00BCD4 30%, #006064 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #0097A7 30%, #004D40 90%)',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 188, 212, 0.5)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#ffffff' }} />
                ) : (
                  'Mint Tokens'
                )}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 
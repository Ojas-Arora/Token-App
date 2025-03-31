import { FC, useState, ChangeEvent, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, Keypair, LAMPORTS_PER_SOL, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress, createMint, createAssociatedTokenAccount, TOKEN_PROGRAM_ID, getAccount, MINT_SIZE, createInitializeMintInstruction } from '@solana/spl-token';
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
} from '@mui/material';
import { toast } from 'react-toastify';

export const TokenManager: FC = () => {
  const wallet = useWallet();
  const { publicKey, signTransaction } = wallet;
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [decimals, setDecimals] = useState('9');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenMint, setTokenMint] = useState('');
  const [solBalance, setSolBalance] = useState<number>(0);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

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
      toast.error('Please connect your wallet first');
      return;
    }

    if (!tokenName || !tokenSymbol) {
      toast.error('Please enter token name and symbol');
      return;
    }

    try {
      setLoading(true);
      toast.info('Creating token...');
      
      // Create new token mint
      const mintKeypair = Keypair.generate();
      const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
      
      // Create transaction
      const transaction = new Transaction();
      
      // Add system program instruction to create mint account
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          lamports,
          space: MINT_SIZE,
          programId: TOKEN_PROGRAM_ID,
        })
      );

      // Add initialize mint instruction
      transaction.add(
        createInitializeMintInstruction(
          mintKeypair.publicKey,
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

      // Sign transaction
      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature);

      setTokenMint(mintKeypair.publicKey.toBase58());
      toast.success(`Token created successfully! Mint address: ${mintKeypair.publicKey.toBase58()}`);
    } catch (error) {
      console.error('Error creating token:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create token');
    } finally {
      setLoading(false);
    }
  };

  const handleMintTokens = async () => {
    if (!publicKey || !signTransaction || !tokenMint) {
      toast.error('Please connect your wallet and create a token first');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
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
      const mintInstruction = new TransactionInstruction({
        keys: [
          { pubkey: new PublicKey(tokenMint), isSigner: true, isWritable: true },
          { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: false },
        ],
        programId: TOKEN_PROGRAM_ID,
        data: Buffer.from([
          9, // mintTo instruction
          ...new Uint8Array(8).fill(0), // amount (8 bytes)
        ]),
      });

      // Create and sign transaction
      const transaction = new Transaction().add(mintInstruction);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      toast.success(`Tokens minted successfully! Transaction: ${signature}`);
    } catch (error) {
      console.error('Error minting tokens:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to mint tokens');
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
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Wallet Info Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Wallet Information
              </Typography>
              {publicKey ? (
                <>
                  <Typography variant="body2">
                    Address: {publicKey.toBase58()}
                  </Typography>
                  <Typography variant="body2">
                    SOL Balance: {solBalance.toFixed(4)} SOL
                  </Typography>
                  {tokenMint && (
                    <Typography variant="body2">
                      Token Balance: {tokenBalance.toFixed(4)} {tokenSymbol}
                    </Typography>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="error">
                  Please connect your wallet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Token Creation Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom align="center" sx={{ mb: 4 }}>
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
              />
              
              <TextField
                label="Token Symbol"
                value={tokenSymbol}
                onChange={handleInputChange(setTokenSymbol)}
                fullWidth
                variant="outlined"
                required
              />
              
              <TextField
                label="Decimals"
                type="number"
                value={decimals}
                onChange={handleInputChange(setDecimals)}
                fullWidth
                variant="outlined"
                required
              />
              
              <Button
                variant="contained"
                onClick={handleCreateToken}
                disabled={loading || !publicKey || !tokenName || !tokenSymbol}
                sx={{ minWidth: 150 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Token'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Token Minting Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom align="center" sx={{ mb: 4 }}>
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
              />
              
              <Button
                variant="contained"
                onClick={handleMintTokens}
                disabled={loading || !publicKey || !tokenMint || !amount}
                sx={{ minWidth: 150 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Mint Tokens'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 
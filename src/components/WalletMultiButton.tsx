import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton as SolanaWalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Box, Typography } from '@mui/material';

export const WalletMultiButton: FC = () => {
  const { publicKey, connected } = useWallet();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <SolanaWalletMultiButton className="wallet-button" />
      {connected && (
        <Typography variant="body2" sx={{ color: '#fff' }}>
          {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
        </Typography>
      )}
    </Box>
  );
}; 
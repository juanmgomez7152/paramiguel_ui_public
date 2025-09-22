import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
// import Divider from '@mui/material/Divider';
// import AppAppBar from './components/AppAppBar';
// import Hero from './components/Hero';
// import LogoCollection from './components/LogoCollection';
// import Highlights from './components/Highlights';
// import Pricing from './components/Pricing';
// import Features from './components/Features';
// import Testimonials from './components/Testimonials';
// import FAQ from './components/FAQ';
import Footer from './components/Footer';
import AppTheme from '../shared-theme/AppTheme';
import Chat from '../chat/chat';
import { Typography } from '@mui/material';

export default function MarketingPage(props) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      {/* <AppAppBar /> */}
      <div>
      <Typography
          variant="h1"
          component="h1"
          sx={{
            textAlign: 'center',
            py: 6,
            fontFamily: 'Segoe Script',
            fontWeight: 700,
            background: (theme) => theme.palette.background.default,
            color: (theme) => theme.palette.primary.main,
            whiteSpace: 'pre-wrap',
          }}
        >
         {'El Traductor \nPara Todos!'}
        </Typography>
        <Chat />
        <Footer />
      </div>
    </AppTheme>
  );
}

import * as React from 'react';
import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
// import InputLabel from '@mui/material/InputLabel';
// import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
// import TextField from '@mui/material/TextField';
// import Typography from '@mui/material/Typography';
import FacebookIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';
// import SitemarkIcon from './SitemarkIcon';
// function Copyright() {
//   return (
//     <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
//       {'Copyright © '}
//       <Link color="text.secondary" href="https://mui.com/">
//         Sitemark
//       </Link>
//       &nbsp;
//       {new Date().getFullYear()}
//     </Typography>
//   );
// }

export default function Footer() {
  const mode = useColorScheme();
  const theme = useTheme();
  const handleThemeChange = () =>{
    if (theme.palette.mode === 'dark') {
      mode.mode = 'light';
      mode.setMode('light');
    }else{
      mode.mode = 'light';
      mode.setMode('dark');
    }
    return theme;
  }
  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 4, sm: 8 },
        py: { xs: 8, sm: 10 },
        textAlign: { sm: 'center', md: 'left' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          pt: { xs: 4, sm: 8 },
          width: '100%',
        }}
      >
        {/* <div>
          <Link color="text.secondary" variant="body2" href="#">
            Privacy Policy
          </Link>
          <Typography sx={{ display: 'inline', mx: 0.5, opacity: 0.5 }}>
            &nbsp;•&nbsp;
          </Typography>
          <Link color="text.secondary" variant="body2" href="#">
            Terms of Service
          </Link>
          <Copyright />
        </div> */}
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ justifyContent: 'right', color: 'text.secondary' }}
        >
          <IconButton
            color="inherit"
            size="small"
            href="https://github.com/juanmgomez7152"
            aria-label="GitHub"
            sx={{ alignSelf: 'center' }}
          >
            <FacebookIcon />
          </IconButton>
          <IconButton
            color="inherit"
            size="small"
            href="https://www.linkedin.com/in/jmgomezguzman7/"
            aria-label="LinkedIn"
            sx={{ alignSelf: 'center' }}
          >
            <LinkedInIcon />
          </IconButton>
          <IconButton
            color="inherit"
            size="small"
            onClick={handleThemeChange}
            aria-label="Toggle theme"
            sx={{ alignSelf: 'center' }}
          >
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Stack>
      </Box>
    </Container>
  );
}

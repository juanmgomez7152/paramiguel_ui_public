import ChatBoxWithInputBar from './chat-box/chatBoxWithInputBar';
// import SingleTranslationInterface from './single-translation-interface/singleTranslationInterface';
import { 
  Button,
  Divider,
  Zoom,
  Grow,
  Box
} from '@mui/material';
import {Person } from '@mui/icons-material';
import { useEffect,useState, useRef} from 'react';
import AppTheme from '../shared-theme/AppTheme';
import CssBaseline from '@mui/material/CssBaseline';
import { blue } from '@mui/material/colors';
import SingleTranslationInterface from './single-translation-interface/singleTranslationInterface';
import supportedLanguages from '../resources/supported_languages.json';
export default function Chat(props) {
  const [isTwoPersonChat, setIsTwoPersonChat] = useState(false);
  const [languages, setLanguages] = useState([]);
  const containerRef = useRef(null);
  const didFetchLanguages = useRef(false);

  useEffect(() => {
    const loadLanguages = () => {
      try {
        // Transform the JSON object into array of [country, language] pairs
        const availableLanguages = [];
        
        Object.entries(supportedLanguages).forEach(([language, countries]) => {
          countries.forEach(country => {
            availableLanguages.push([country, language]);
          });
        });
        setLanguages(availableLanguages);
      } catch (error) {
        console.error("Error loading languages from JSON:", error);
      }
    };
    
    if(!didFetchLanguages.current){
      loadLanguages();
      didFetchLanguages.current = true;
    }
  }, []);

  if (isTwoPersonChat) {
    return (
      <Grow in={isTwoPersonChat} mountOnEnter unmountOnExit>
          <div ref={containerRef}>
          <AppTheme {...props}>
          <CssBaseline enableColorScheme />
          {/* <AppAppBar /> */}
          <Box 
          sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}
          >
            <Box style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
              <ChatBoxWithInputBar
              availableLanguages={languages}
              />
              <Divider orientation='vertical' flexItem />
              <ChatBoxWithInputBar
              availableLanguages={languages}
              chatBgColor={blue[100]}
              />
            </Box>
            <Button 
            sx={{
              padding: 0,
              minWidth: '40px',
              height: '40px',
              borderRadius: '50%',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  '&::after': {
                  content: '"Traduccion Simple"',
                  position: 'absolute',
                  top: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#47536B',
                  color: 'white',
                  padding: '2px 5px',
                  borderRadius: '3px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  zIndex: 1,
                  }
                
              },
              '&:active': {
                transform: 'scale(0.95)'
              },
              '&:focus': {
                outline: 'none',
              },

            }}
            onClick={() => setIsTwoPersonChat(false)}>
              <Person />
            </Button>
          </Box>
          </AppTheme>
          </div>
      </Grow>
    );
  }else{
    return (
      <Zoom in={!isTwoPersonChat} mountOnEnter unmountOnExit>
        <div ref={containerRef}>
        <AppTheme {...props}>
          <CssBaseline enableColorScheme />
          <Box 
          sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}
          >
            {/* <SingleTranslationInterface
          availableLanguages={languages}
          /> */}
          <SingleTranslationInterface
          availableLanguages = {languages}
          />
          {/* <Button 
          sx={{
            padding: 0,
            minWidth: '40px',
            height: '40px',
            borderRadius: '50%',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                transform: 'scale(1.1)',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                '&::after': {
                content: '"Traduccion de Grupo"',
                position: 'absolute',
                top: '-25px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#47536B',
                color: 'white',
                padding: '2px 5px',
                borderRadius: '3px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                zIndex: 1,
                }
              
            },
            '&:active': {
              transform: 'scale(0.95)'
            },
            '&:focus': {
              outline: 'none',
            },
          }}
            onClick={() => setIsTwoPersonChat(true)}
          >
            <People />
          </Button> */}
          </Box>
          
        </AppTheme>
        </div>
      </Zoom>
    );
  }
}
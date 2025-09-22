import { 
    Box,
    Button,
    Paper,
    TextField,
    Stack,
    Typography,
    InputAdornment,
    Divider,
    Menu,
    MenuItem,
    keyframes,
    alpha
  } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import AddIcon from '@mui/icons-material/Add';
import TrashIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import { useState,useEffect , useRef} from 'react';
import { TranslateMessage,
          SendPicture
 } from '../chat-service/chatService';
import { useTheme } from '@mui/material/styles';

export default function ChatBoxWithInputBar(
  { availableLanguages, chatBgColor }
) {
    const [messages, setMessages] = useState([
    { text: 'Bienvenido! Que quisieras que tradusca?', sender: 'bot',completed: true }
    ]);
    const [newMessage, setNewMessage,] = useState('');
    const [languages, setLanguages] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [inputDisabled, setInputDisabled] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const messageEndRef = useRef(null);
    const theme = useTheme();
    const shimmer = keyframes`
      0% { background-position: -200px 0; }
      100% { background-position: 200px 0; }
    `;
    const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
    `;    

    const startRecording = async () => {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage?.code || 'es-ES';
    
        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          
          setNewMessage(transcript);
        };
    
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          stopRecording();
        };
    
        recognition.start();
        setRecognition(recognition);
        setIsRecording(true);
        setInputDisabled(true);
    
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    };
    
    // Update stopRecording function
    const stopRecording = () => {
      if (recognition) {
        recognition.stop();
        setRecognition(null);
      }
      setIsRecording(false);
      setInputDisabled(false);
    };

    const scrollToBottom = () => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

  useEffect(() => {
    if (availableLanguages && availableLanguages.length > 0) {
      setLanguages(availableLanguages);
      if (!selectedLanguage) {
        setSelectedLanguage(availableLanguages[0]);
      }
    }
  }, [availableLanguages, selectedLanguage]);  
    
    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    const handleSettingsClick = (event) => {
      setAnchorEl(event.currentTarget);
    }
    
    const handleMenuClose = () => {
      setAnchorEl(null);
    }

    const handleLanguageSelect = async (language) => {
      try {
        setSelectedLanguage(language);
        console.log("Country set to:", language);
        handleMenuClose();
      } catch (error) {
        console.error("Error setting language:", error);
      }
    };
    
    const handleSend = async () => {
      if (newMessage.trim()) {
        setMessages(messages => [...messages, { text: newMessage, sender: 'user',completed:true }]);
        setNewMessage('');
        setMessages(prev => [...prev, { text: '', sender: 'bot' , fulltext: '',completed: false}]);

        setInputDisabled(true);
        
        try {
          const translation = await TranslateMessage(newMessage,selectedLanguage);
          const chars = translation.answer.split('');
          setIsTyping(true);
          const updateMessageWithChar = (char) => {
            return (prevMessages) => {
              const updated = [...prevMessages];
              const lastIndex = updated.length - 1;
              if(chars.indexOf(char) === chars.length - 1){
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  text: updated[lastIndex].text + char,
                  fulltext: translation.answer,
                  completed: true
                  };
              }else{
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  text: updated[lastIndex].text + char,
                  fulltext: translation.answer
                  };
              }
              return updated;
            };
          };

          for (const char of chars) {
            await new Promise(res => setTimeout(res, 80));
            setMessages(updateMessageWithChar(char),chars);
          }
          setIsTyping(false);
          setInputDisabled(false);
        } catch (error) {
          console.error("Translation error:", error);
          setMessages(messages => [...messages, { 
          text: "Perdon, sucedio un error al traducir.", 
          sender: 'bot',
          completed: true
          }]);
          setIsTyping(false);
          setInputDisabled(false);
        }
      }
    };

    const handlePicture = async () => {
      try {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = async (e) => {
              const file = e.target.files[0];
              setInputDisabled(true);
              if (file) {
                  const response = await SendPicture(file);
                  setInputDisabled(false);
                  setNewMessage(response);
              }
          };
          input.click();

      } catch (error) {
          console.error("Picture upload error:", error);
          setNewMessage("Perdon, sucedio un error al subir la imagen.");
      }
  };

  const eraseMessages = () => {
    setMessages([]);
    setMessages(messages => [...messages, { text: 'Bienvenido! Que quisieras que tradusca?', sender: 'bot',completed: true }]);
  };    
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
           
      <Paper elevation={3} sx={{ 
          p: 2, 
          height: 400, 
          display: 'flex', 
          backgroundColor: chatBgColor || 'inherit',
          flexDirection: 'column',
          overflow: 'hidden',
          '& *': {
            '&::-webkit-scrollbar': {
              width: 0,
              background: 'transparent',
              display: 'none'
            }
          }
        }}>
          <Box 
            component="div"
            sx={{ 
              flexGrow: 1, 
              overflow: 'auto', 
              mb: 2,
              '&': {
                scrollbarWidth: 'none',
                '-ms-overflow-style': 'none',
              },
              '&::-webkit-scrollbar': {
                width: 0,
                background: 'transparent',
                display: 'none'
              }
            }}
          >
          <Stack className='message-content' spacing={2}>
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    backgroundColor: message.sender === 'user' ? 'primary.light' : 'grey.100',
                    maxWidth: '70%'
                  }}
                >
                  <Typography color={message.sender === 'user' ? 'white' : 'black'}>{ message.completed||isTyping ? message.text:message.fulltext}</Typography>
                  {isTyping && !message.completed &&message.sender ==='bot' && ( // Only show button on last message while typing
                    <Button 
                      onClick={() => {
                        setIsTyping(false);
                        setInputDisabled(false);
                      }}
                      sx={{
                        padding: 0,
                        minWidth: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        alignItems: 'center',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          '&::after': {
                          content: '"Traducción Completa"',
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
                    >
                      <RocketLaunchRoundedIcon sx={{color: (theme) => theme.palette.primary.dark}}/>
                    </Button>
                  )}
                </Paper>
              </Box>
            ))}
            {isTyping && ( // Only show button on last message while typing 
              <div ref={messageEndRef} />
            )}
            
          </Stack>
        </Box>
        <Box className='InputBar'  sx={{ display: 'flex', gap: 1 }}>
          <TextField className='InputField'
            fullWidth
            multiline
            minRows={1}
            maxRows={3}
            disabled={inputDisabled}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escriba aqui..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            sx={{
              '& .MuiOutlinedInput-root': {
                transition: 'background-color 0.3s ease',
                backgroundColor: inputDisabled
                  ? alpha(theme.palette.action.disabledBackground, 0.8)
                  : 'theme.palette.background.default',
                backgroundImage: inputDisabled
                  ? `linear-gradient(90deg, 
                      ${alpha(theme.palette.background.default, 0.6)} 0%, 
                      ${alpha(theme.palette.primary.light, 0.15)} 20%, 
                      ${alpha(theme.palette.background.default, 0.6)} 40%
                    )`
                  : 'none',
                backgroundSize: '400px 100%',
                animation: inputDisabled ? `${shimmer} 1.5s infinite ease-in-out` : 'none',
                flex: 1,
                borderRadius: '40px',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Menu className='LanguageMenu'
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                  >
                    {languages.map((lang) => (
                        <MenuItem 
                            key={lang}
                            onClick={() => handleLanguageSelect(lang)}
                            selected={selectedLanguage === lang}
                        >
                            {lang}
                        </MenuItem>
                    ))}
                  </Menu> 
                  <Button
                  disabled={inputDisabled}
                  onClick={handleSettingsClick}
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
                        content: '"Configuración"',
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
                  }}>
                    <SettingsIcon />
                  </Button>
                  <Button className='PictureUploadButton'
                    disabled={inputDisabled}
                    onClick={handlePicture}
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
                        content: '"Subir Contenido"',
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
                    }}>
                    <AddIcon />
                  </Button>
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  <InputAdornment position="end">
                  <Button className='RecordButton'
                    disabled={inputDisabled && !isRecording}
                    onClick={isRecording ? stopRecording : startRecording}
                    sx={{
                      padding: 0,
                      minWidth: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      animation: isRecording ? `${pulse} 1.5s infinite` : 'none',
                      backgroundColor: isRecording ? 'error.main' : 'inherit',
                      color: isRecording ? 'white' : 'inherit',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        backgroundColor: isRecording ? 'error.dark' : 'rgba(0, 0, 0, 0.04)',
                        '&::after': {
                          content: isRecording ? '"Detener Grabación"' : '"Iniciar Grabación"',
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
                    }}>
                    {isRecording ? <StopIcon /> : <MicIcon />}
                  </Button>
                  <Button className='SendButton'
                    disabled={inputDisabled}
                    onClick={handleSend}
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
                        content: '"Enviar Mensaje"',
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
                    }}>
                    <SendIcon />
                  </Button>

                  </InputAdornment>
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: '100%' }} />
                  <InputAdornment position="end">
                  <Button className='EraseButton'
                    disabled={inputDisabled}
                    onClick={eraseMessages}
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
                        content: '"Borrar Mensajes"',
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
                    }}>
                    <TrashIcon />
                  </Button>
                  </InputAdornment>
                </>
              ),
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
import React, { useState,useEffect,useRef } from "react";
import { 
  TextField, 
  Button, 
  Box, 
  Menu, 
  MenuItem, 
  Paper, 
  alpha, 
  keyframes, 
  Snackbar, 
  List,
  ListSubheader,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Backdrop
} from "@mui/material";
import { motion } from "framer-motion";
// import { getSpeech } from "../../openai/openaiServices";
import { TranslateMessage,SendPicture,GetAudio } from "../chat-service/chatService";
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import ReplayIcon from '@mui/icons-material/Replay';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ErrorIcon from '@mui/icons-material/Error';
import { useTheme } from '@mui/material/styles';

export default function SingleTranslationInterface({availableLanguages}){
  const [input, setInput] = useState("");
  const [lastMessage, setLastMessage] = useState("");
  const [translation, setTranslation] = useState("");
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [partialTranslation, setPartialTranslation] = useState("");
  const [history, setHistory] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [ anchorLanguage, setAnchorLanguage ] = useState(null);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const audioRef = useRef(null);
  const retryingRef = useRef(false);
  const typingRef = useRef(false);
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
  }, [partialTranslation]);

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
        
        setInput(transcript);
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
  
  const handleErrorDialogClose = () => {
    setShowErrorDialog(false);
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
                setInput(response);
            }
        };
        input.click();

    } catch (error) {
        console.error("Picture upload error:", error);
        setInput("Perdon, sucedio un error al subir la imagen.");
    }
  };

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setInputDisabled(true);
    setIsTyping(true);
    typingRef.current = true;
    try{
        const result=await TranslateMessage(input,selectedLanguage[0])
        setLastMessage(input);
        setInput("");
        const translation = result.answer;
        setTranslation(translation);
        for(let i=0;i<translation.length;i++){
          if(!typingRef.current){
            break;
          }
          let partialTranslation=translation.substring(0,i);
          setPartialTranslation(partialTranslation);
          await new Promise(resolve => setTimeout(resolve, 80));
        }
        if(typingRef.current){setPartialTranslation(translation);}
        if (!history.includes(input)) {
            setHistory((prev) => [input, ...prev.slice(0, 9)]);
        }
        typingRef.current = false;
        setIsTyping(false);
        setInputDisabled(false);
    }catch(error){
        console.error("Error translating message:", error.status);
        setShowErrorDialog(true);
        setInputDisabled(false);
    }
  };

  const stopTyping = () => {
    typingRef.current = false;
    retryingRef.current = false;
    setIsTyping(false);
    setPartialTranslation("");
    setInputDisabled(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translation);
    setShowCopyNotification(true);
    setInputDisabled(false);
    setTimeout(() => setShowCopyNotification(false), 2000);
  };
  
  const handleRetryTranslateClick = async() => {
    setInputDisabled(true);
    setIsTyping(true);
    typingRef.current = true;
    retryingRef.current = true;
    try{
        const result=await TranslateMessage(lastMessage,selectedLanguage[0],true)
        setInput("");
        retryingRef.current = false;
        const translation = result.answer;
        setTranslation(translation);
        for(let i=0;i<translation.length;i++){
          if(!typingRef.current){
            break;
          }
          let partialTranslation=translation.substring(0,i);
          setPartialTranslation(partialTranslation);
          await new Promise(resolve => setTimeout(resolve, 80));
        }
        if(typingRef.current){setPartialTranslation(translation);}
        if (!history.includes(input)) {
            setHistory((prev) => [input, ...prev.slice(0, 9)]);
        }
        typingRef.current = false;
        
        setIsTyping(false);
        setInputDisabled(false);
    }catch(error){
        console.error("Error translating message:", error);
        setInputDisabled(false);
    }    
  };

  const handleHistoryClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleHistorySelect = (text) => {
    setInput(text);
    setAnchorEl(null);
  };

  const handleSettingsClick = (event) => {
    setAnchorLanguage(event.currentTarget);
  }
  
  const handleMenuClose = () => {
    setAnchorLanguage(null);
  }
  const handleLanguageSelect = async (language) => {
    try {
      setSelectedLanguage(language);
    //   console.log("Country set to:", language);
      handleMenuClose();
    } catch (error) {
      console.error("Error setting language:", error);
    }
  };

  const handleTextToSpeech = async () => {
    try {
        if (isPlaying && audioRef.current) {
            // Stop current audio
            audioRef.current.pause();
            audioRef.current = null;
            setIsPlaying(false);
            setIsGeneratingSpeech(false);
            setInputDisabled(false);
            return;
        }

        setInputDisabled(true);
        setIsGeneratingSpeech(true);
        
        const audioUrl = await GetAudio(translation,selectedLanguage[0]);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.addEventListener('ended', () => {
            URL.revokeObjectURL(audioUrl);
            setInputDisabled(false);
            setIsGeneratingSpeech(false);
            setIsPlaying(false);
            audioRef.current = null;
        });

        audio.addEventListener('error', () => {
            console.error("Error playing audio");
            URL.revokeObjectURL(audioUrl);
            setInputDisabled(false);
            setIsGeneratingSpeech(false);
            setIsPlaying(false);
            audioRef.current = null;
        });

        await audio.play();
        setIsPlaying(true);
        setIsGeneratingSpeech(false);
    } catch (error) {
        console.error("Error getting speech file:", error);
        setInputDisabled(false);
        setIsGeneratingSpeech(false);
        setIsPlaying(false);
        audioRef.current = null;
    }
};

  return (
    <Box 
    display="flex" 
    mx="auto"
    flexDirection="column" 
    alignItems='center'
    gap={2} 
    p={3}
    sx={{ 
      opacity: showErrorDialog ? 0.3 : 1,
      pointerEvents: showErrorDialog ? 'none' : 'auto',
      transition: 'opacity 0.3s ease'
    }}
    >
      {/* Input Box */}
      <Paper elevation={3} 
      sx={{ 
        p: 2, 
        borderRadius: 2,
        maxWidth: '500px',
        minWidth: '400px',
        minHeight: '250px', 
        alignItems: 'center',
      }}> 
        <Button
              disabled={inputDisabled}
              onClick={handleHistoryClick}
              sx={{
                padding: 0,
                display: 'flex',
                justifySelf: 'flex-end',
                marginTop: '-15px',
                marginRight: '-15px',
                minWidth: '40px',
                height: '40px',
                borderRadius: '50%',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    transform: 'scale(1.1)',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    '&::after': {
                    content: '"Historial"',
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
                <HistoryIcon />
        </Button>
        <TextField
            fullWidth
            multiline
            rows={6}
            disabled={inputDisabled}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escriba aqui..."
            onKeyPress={(e) => e.key === 'Enter' && handleTranslate()}
            sx={{
                '& .MuiOutlinedInput-input': {
                overflowY: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                    width: 0,
                    display: 'none',
                },
                },
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
                borderRadius: '20px',
              },
            }}
            InputProps={{
                endAdornment: (
                    <Button className='RecordButton'
                    disabled={inputDisabled && !isRecording}
                    onClick={isRecording ? stopRecording : startRecording}
                    sx={{
                      padding: 0,
                      mb:-12,
                      mr:-1,
                      minWidth: '30px',
                      height: '30px',
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
                ),
            }}      
        />
        <Box display="flex" flexDirection="row" sx={{mt: 2}}>
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
            <Button
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
                }}
            >
                <AddIcon />
            </Button>
            <Button 
            disabled={inputDisabled}
            variant="contained" 
            fullWidth 
            onClick={handleTranslate}
            >
                Traducir
            </Button>
        </Box>
        
      </Paper>

      {/* Translation Box */}
      {translation && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
        >
          <Paper
            elevation={5}
            sx={{
              maxWidth: '500px',
              width: '400px',
              maxHeight: '300px',
              height: '250px',
              p: 2,
              mt: 2,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box 
              sx={{ 
                whiteSpace: 'pre-wrap',
                mb: 2, 
                color: theme.palette.text.primary,
                wordBreak: 'break-word',
                overflowY: 'auto',
                scrollbarWidth: 'none',
                fontSize: theme.typography.subtitle1.fontSize,  // Using MUI's typography scale
                fontFamily: theme.typography.subtitle1.fontFamily,
                lineHeight: theme.typography.subtitle1.lineHeight,
                '&::-webkit-scrollbar': {
                  width: 0,
                  display: 'none',
                },
              }}
            >
              {isTyping ? partialTranslation : translation}
              {isTyping? <div ref={messageEndRef} /> : null}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={handleCopy}
                disabled={inputDisabled}
                size="small"
                color="primary"
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
                      content: '"Copiar Texto"',
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
                <ContentCopyIcon />
              </Button>
              <Button
                disabled={inputDisabled}
                onClick={
                  handleRetryTranslateClick
                }
                size="small"
                color="primary"
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
                        content: '"Reintentar Traducción"',
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
                <ReplayIcon />
              </Button>
              <Button
                disabled={inputDisabled && !isPlaying}
                onClick={handleTextToSpeech}
                size="small"
                color="primary"
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
                          content: isPlaying ? '"Detener Audio"' : '"Escuchar Traducción"',
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
                {isGeneratingSpeech ? (
                    <CircularProgress size={24} color="inherit" />
                ) : isPlaying ? (
                    <StopCircleIcon />
                ) : (
                    <VolumeUpIcon />
                )}
            </Button>
              {isTyping && !retryingRef.current &&<Button
                onClick={stopTyping}
                size="small"
                color="secondary"
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
                        content: '"Ver Traducción"',
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
                <RocketLaunchRoundedIcon sx={{color: (theme) => theme.palette.primary.dark}} />
              </Button>}
            </Box>
          </Paper>
          <Snackbar
            open={Boolean(showCopyNotification)}
            autoHideDuration={2000}
            onClose={() => setShowCopyNotification(false)}
            message="Texto copiado!"
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          />
        </motion.div>
      )}

      {/* History Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {history.length > 0 ? (
          history.map((item, index) => (
            <MenuItem key={index} onClick={() => handleHistorySelect(item)}
            sx={{
              width:'200px'
            }}>
              {item}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No tienes historial</MenuItem>
        )}
      </Menu>
      {/* Countries Menu */}
      <Menu 
        className='LanguageMenu'
        anchorEl={anchorLanguage}
        open={Boolean(anchorLanguage)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            maxHeight: '300px',
            width: '200px',
          }
        }}
      >
        {Object.entries(
          languages.reduce((acc, [country, language]) => {
            if (!acc[language]) {
              acc[language] = [];
            }
            acc[language].push(country);
            return acc;
          }, {})
        ).map(([language, countries]) => (
          <List
            key={language}
            subheader={
              <ListSubheader 
                sx={{ 
                  bgcolor: 'background.paper',
                  fontWeight: 'bold',
                  lineHeight: '30px'
                }}
              >
                {language}
              </ListSubheader>
            }
          >
            {countries.map((country) => (
              <MenuItem
                key={country}
                onClick={() => handleLanguageSelect([country, language])}
                selected={selectedLanguage?.[0] === country}
                sx={{
                  pl: 4,
                  minHeight: '35px'
                }}
              >
                {country}
              </MenuItem>
            ))}
          </List>
        ))}
      </Menu>
            {/* Error Dialog */}
      <Dialog
        open={showErrorDialog}
        onClose={handleErrorDialogClose}
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.shadows[24],
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            textAlign: 'center',
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            color: theme.palette.error.main
          }}
        >
          <ErrorIcon fontSize="large" />
          Error de Solicitud
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Ha ocurrido un error con su solicitud. Por favor, contacte a Juan Gomez para obtener asistencia.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lamentamos las molestias ocasionadas.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={handleErrorDialogClose}
            variant="contained"
            color="primary"
            size="large"
            sx={{
              minWidth: 120,
              borderRadius: 2,
            }}
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    
  );
}
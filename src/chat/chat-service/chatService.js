import { environment } from "../../environment/environment";

export const TranslateMessage = async (message,language,retry=false) => {
    try {
        const response = await fetch(`${environment.apiUrl}/translation/send-message/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message, language,retry })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = JSON.parse(await response.json());
        return data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export const StreamTranslation = async (message, onChunk) => {
    try {
        const response = await fetch(`${environment.apiUrl}/translation/stream-message/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        return new Promise(async (resolve, reject) => {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        if (buffer.length > 0) {
                            // console.log("Final chunk:", buffer);
                            onChunk(buffer);
                        }
                        resolve();
                        break;
                    }
                    
                    buffer += decoder.decode(value, { stream: true });
                    
                    // Try to find complete chunks
                    const chunks = buffer.split('\n');
                    buffer = chunks.pop() || ''; // Keep the last incomplete chunk
                    
                    for (const chunk of chunks) {
                        if (chunk.trim()) {
                            // console.log("Processing chunk:", chunk);
                            onChunk(chunk);
                        }
                    }
                }
            } catch (error) {
                console.error("Streaming error:", error);
                reader.cancel();
                reject(error);
            }
        });
    } catch (error) {
        console.error("Connection error:", error);
        throw error;
    }
}

export const SendPicture = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${environment.apiUrl}/translation/upload-picture/`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const parsedResponse = (JSON.parse(await response.json()))['extracted_text'];
        return parsedResponse;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export const GetLanguages = async () => {
    try {
        const response = await fetch(`${environment.apiUrl}/translation/languages`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = JSON.parse(await response.json());
        const languages = data.languages;
        return languages;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export const GetAudio = async (message,language) => {
    try {
        const response = await fetch(`${environment.apiUrl}/translation/turn-text-to-speech/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message,language })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const audioBlob = new Blob([await response.arrayBuffer()], { type: 'audio/mpeg' });
        return URL.createObjectURL(audioBlob);
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import threading
import queue
import time
from datetime import datetime
import assemblyai as aai
import os
import tempfile
from typing import Dict, List, Optional

# Set AssemblyAI API key
aai.settings.api_key = "6c7ffcf7a06749e088a78cc5b144afcb"

# Global variables to manage recording sessions
active_sessions: Dict[str, 'SpeechRecognitionSession'] = {}
session_results: Dict[str, List[dict]] = {}

class SpeechRecognitionSession:
    def __init__(self, session_id: str, language: str = "en_us"):
        self.session_id = session_id
        self.language = language
        self.is_active = True
        self.audio_queue = queue.Queue()
        self.results = []
        self.transcriber = aai.Transcriber()
        
        # Start the processing thread
        self.processing_thread = threading.Thread(target=self.process_audio)
        self.processing_thread.daemon = True
        self.processing_thread.start()
        
    def process_audio(self):
        """Process audio chunks from the queue and convert to text"""
        while self.is_active:
            try:
                if not self.audio_queue.empty():
                    audio_data = self.audio_queue.get()
                    
                    try:
                        # Create a temporary file to store the audio data
                        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_audio_file:
                            temp_audio_file.write(audio_data)
                            temp_file_path = temp_audio_file.name
                        
                        # Transcribe the audio file using AssemblyAI
                        try:
                            transcript = self.transcriber.transcribe(temp_file_path)
                            
                            if transcript.text:
                                timestamp = datetime.now().strftime("%H:%M:%S")
                                result = {"text": transcript.text, "timestamp": timestamp}
                                self.results.append(result)
                                session_results[self.session_id] = self.results
                                print(f"Session {self.session_id}: {transcript.text}")
                            else:
                                print(f"Session {self.session_id}: No text was transcribed")
                        
                        except Exception as e:
                            print(f"Session {self.session_id}: Error with AssemblyAI transcription: {e}")
                        
                        # Clean up the temporary file
                        os.unlink(temp_file_path)
                        
                    except Exception as e:
                        print(f"Error processing audio chunk: {e}")
                else:
                    # Wait a short time before checking the queue again
                    time.sleep(0.1)
            except Exception as e:
                print(f"Error processing audio in session {self.session_id}: {e}")
    
    def add_audio_chunk(self, audio_chunk: bytes):
        """Add audio chunk to the processing queue"""
        self.audio_queue.put(audio_chunk)
    
    def stop(self):
        """Stop the session"""
        self.is_active = False

def map_language_code(language_code: str) -> str:
    """Map frontend language code to AssemblyAI language code"""
    language_map = {
        "en-US": "en_us",
        "en-GB": "en_gb",
        "es-ES": "es",
        "fr-FR": "fr",
        "de-DE": "de",
        "ja-JP": "ja",
        "zh-CN": "zh",
        # Add more mappings as needed
    }
    return language_map.get(language_code, "en_us")

# Create FastAPI app
app = FastAPI(title="Speech Recognition API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class SessionRequest(BaseModel):
    language: str = "en-US"

class SessionResponse(BaseModel):
    session_id: str
    status: str
    message: str

class AudioResponse(BaseModel):
    status: str
    message: str

class ResultsResponse(BaseModel):
    session_id: str
    results: List[dict]

class StopSessionResponse(BaseModel):
    status: str
    session_id: str
    results: List[dict]
    message: str

@app.post("/api/start-session", response_model=SessionResponse)
async def start_session(request: SessionRequest):
    """Start a new speech recognition session"""
    # Map frontend language code to AssemblyAI language code
    language = map_language_code(request.language)
    
    # Generate a new session ID
    session_id = f"session_{int(time.time())}"
    
    # Create and store the new session
    session = SpeechRecognitionSession(session_id, language)
    active_sessions[session_id] = session
    session_results[session_id] = []
    
    return SessionResponse(
        session_id=session_id,
        status="started",
        message="Speech recognition session started"
    )

@app.post("/api/process-audio/{session_id}", response_model=AudioResponse)
async def process_audio(session_id: str, audio: UploadFile = File(...)):
    """Process an audio chunk for a session"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    try:
        # Read and process the audio data
        audio_data = await audio.read()
        
        # Make sure we have data
        if len(audio_data) > 0:
            active_sessions[session_id].add_audio_chunk(audio_data)
            
            return AudioResponse(
                status="processing",
                message="Audio chunk received and queued for processing"
            )
        else:
            raise HTTPException(status_code=400, detail="Empty audio data received")
    except Exception as e:
        print(f"Error processing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stop-session/{session_id}", response_model=StopSessionResponse)
async def stop_session(session_id: str):
    """Stop a speech recognition session"""
    # Check if session exists in active sessions
    if session_id not in active_sessions:
        # Check if we have results for this session (meaning it was previously active)
        if session_id in session_results:
            # Return the results without an error, as the session was likely already stopped
            return StopSessionResponse(
                status="already_stopped",
                session_id=session_id,
                results=session_results.get(session_id, []),
                message="Speech recognition session was already stopped"
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid session ID")
    
    # Stop the session and retrieve results
    active_sessions[session_id].stop()
    results = session_results.get(session_id, [])
    
    # Clean up
    del active_sessions[session_id]
    
    print(results)
    
    return StopSessionResponse(
        status="stopped",
        session_id=session_id,
        results=results,
        message="Speech recognition session stopped"
    )

@app.get("/api/get-results/{session_id}", response_model=ResultsResponse)
async def get_results(session_id: str):
    """Get current results for a session without stopping it"""
    if session_id not in active_sessions and session_id not in session_results:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    results = session_results.get(session_id, [])
    
    return ResultsResponse(
        session_id=session_id,
        results=results
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
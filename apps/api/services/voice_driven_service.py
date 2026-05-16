import os
import uuid
from datetime import datetime
from typing import Optional, Dict, List

class VoiceDrivenService:
    def __init__(self, mode: str = "mock"):
        self.mode = mode
        self.mock_sessions = {}
        self.mock_commands = {}
        self.mock_transcripts = {}
        
    async def create_session(
        self,
        user_id: str,
        session_name: str
    ) -> Dict:
        """Create a new voice session"""
        session_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        session = {
            "id": session_id,
            "user_id": user_id,
            "session_name": session_name,
            "status": "active",
            "metadata": {},
            "commands": [],
            "transcripts": [],
            "created_at": now,
            "updated_at": now
        }
        
        if self.mode == "mock":
            self.mock_sessions[session_id] = session
            return session
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def process_command(
        self,
        session_id: str,
        user_id: str,
        command_text: str,
        confidence_score: float = 1.0
    ) -> Optional[Dict]:
        """Process a voice command"""
        if self.mode == "mock":
            session = self.mock_sessions.get(session_id)
            if not session:
                return None
            
            command_id = str(uuid.uuid4())
            now = datetime.utcnow().isoformat()
            
            # Simple command type detection
            command_type = "navigate"
            if "create" in command_text.lower():
                command_type = "create"
            elif "edit" in command_text.lower():
                command_type = "edit"
            elif "delete" in command_text.lower():
                command_type = "delete"
            elif "generate" in command_text.lower():
                command_type = "generate"
            
            command = {
                "id": command_id,
                "session_id": session_id,
                "user_id": user_id,
                "command_text": command_text,
                "command_type": command_type,
                "confidence_score": confidence_score,
                "executed": True,
                "result": f"Executed: {command_text}",
                "created_at": now
            }
            
            self.mock_commands[command_id] = command
            session["commands"].append(command)
            return command
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def create_transcript(
        self,
        session_id: str,
        transcript_text: str,
        audio_url: Optional[str] = None,
        language: str = "en-US",
        duration_seconds: float = 0.0
    ) -> Optional[Dict]:
        """Create a voice transcript"""
        if self.mode == "mock":
            session = self.mock_sessions.get(session_id)
            if not session:
                return None
            
            transcript_id = str(uuid.uuid4())
            now = datetime.utcnow().isoformat()
            
            transcript = {
                "id": transcript_id,
                "session_id": session_id,
                "audio_url": audio_url,
                "transcript_text": transcript_text,
                "language": language,
                "duration_seconds": duration_seconds,
                "metadata": {},
                "created_at": now
            }
            
            self.mock_transcripts[transcript_id] = transcript
            session["transcripts"].append(transcript)
            return transcript
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_session_history(
        self,
        session_id: str
    ) -> Optional[Dict]:
        """Get full session history with commands and transcripts"""
        if self.mode == "mock":
            session = self.mock_sessions.get(session_id)
            return session
        else:
            raise NotImplementedError("Prod mode not implemented yet")

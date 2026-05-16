# CreativeForge AI Studio: Database Schema Design

## Database: PostgreSQL 15+
## ORM: SQLModel (combines SQLAlchemy + Pydantic)

---

## Core Tables (with SQLModel definitions)

### 1. Users Table
```python
class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    username: str = Field(unique=True, index=True, max_length=50)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(exclude=True)
    role: str = Field(default="member", max_length=20)  # admin/member/viewer
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: datetime | None = Field(default=None, index=True)  # Soft delete
```

### 2. Projects Table
```python
class Project(SQLModel, table=True):
    __tablename__ = "projects"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    name: str = Field(max_length=100)
    description: str | None = Field(default=None)
    is_public: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: datetime | None = Field(default=None, index=True)
    
    # Relationships
    generations: list["Generation"] = Relationship(back_populates="project")
```

### 3. Generations Table (AI Outputs)
```python
class Generation(SQLModel, table=True):
    __tablename__ = "generations"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    project_id: uuid.UUID = Field(foreign_key="projects.id", index=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    type: str = Field(max_length=20)  # text/image/remix/workflow
    prompt: str
    model: str = Field(max_length=50)  # gpt-2, sdxl, flux
    status: str = Field(default="queued", max_length=20)  # queued/processing/complete/failed
    cfg_scale: float | None = None
    steps: int | None = None
    result_url: str | None = None
    error_message: str | None = None
    metadata: dict = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: datetime | None = None
    
    # Relationships
    project: Project = Relationship(back_populates="generations")
    assets: list["Asset"] = Relationship(back_populates="generation")
```

### 4. Assets Table (Stored Files)
```python
class Asset(SQLModel, table=True):
    __tablename__ = "assets"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    generation_id: uuid.UUID = Field(foreign_key="generations.id", index=True)
    file_path: str  # Local path or S3 key
    file_type: str = Field(max_length=20)  # image/png, text/plain
    file_size: int  # Bytes
    width: int | None = None  # For images
    height: int | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    generation: Generation = Relationship(back_populates="assets")
```

### 5. Prompt History Table
```python
class PromptHistory(SQLModel, table=True):
    __tablename__ = "prompt_history"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    prompt: str
    model: str
    generation_id: uuid.UUID | None = Field(foreign_key="generations.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### 6. Workflows Table (Node-Based Pipelines)
```python
class Workflow(SQLModel, table=True):
    __tablename__ = "workflows"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    name: str = Field(max_length=100)
    description: str | None = None
    nodes: list[dict] = Field(sa_column=Column(JSON))  # Node configurations
    edges: list[dict] = Field(sa_column=Column(JSON))   # Node connections
    is_template: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### 7. Audit Logs Table
```python
class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID | None = Field(foreign_key="users.id")
    action: str = Field(max_length=50)  # create/update/delete/login
    table_name: str | None = None
    record_id: uuid.UUID | None = None
    changes: dict | None = Field(default=None, sa_column=Column(JSON))
    ip_address: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### 8. User Style DNA Table (Style Genome System)
Stores user's artistic style, preferences, and evolution history:
```python
class UserStyleDNA(SQLModel, table=True):
    __tablename__ = "user_style_dna"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True, unique=True)
    preferred_color_palettes: list[str] = Field(default=[], sa_column=Column(JSON))
    composition_tendencies: dict = Field(default={}, sa_column=Column(JSON))
    favorite_prompts: list[str] = Field(default=[], sa_column=Column(JSON))
    lighting_preferences: str | None = Field(default=None, max_length=50)
    style_evolution_history: list[dict] = Field(default=[], sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### 9. Creative Memory Table (Vector Memory Engine)
Requires `pgvector` extension. Stores vector embeddings of user creative history:
```python
from pgvector.sqlalchemy import Vector

class CreativeMemory(SQLModel, table=True):
    __tablename__ = "creative_memory"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    content_type: str = Field(max_length=20)  # prompt/generation/style_note
    content_text: str
    embedding: list[float] = Field(sa_column=Column(Vector(384)))  # 384-dim for all-MiniLM-L6-v2
    metadata: dict = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### 10. Emotion Profiles Table (Emotional AI Generation)
Maps emotions to visual generation parameters:
```python
class EmotionProfile(SQLModel, table=True):
    __tablename__ = "emotion_profiles"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    emotion: str = Field(max_length=50)
    intensity: int = Field(default=50)  # 0-100
    associated_prompts: list[str] = Field(default=[], sa_column=Column(JSON))
    visual_parameters: dict = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## Indexes for Performance
```sql
CREATE INDEX idx_generations_user_status ON generations(user_id, status);
CREATE INDEX idx_generations_project ON generations(project_id);
CREATE INDEX idx_assets_generation ON assets(generation_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at);
CREATE INDEX idx_user_style_dna_user ON user_style_dna(user_id);
CREATE INDEX idx_creative_memory_user ON creative_memory(user_id);
CREATE INDEX idx_emotion_profiles_user ON emotion_profiles(user_id);
```

---

## Key Design Decisions
1. **Soft Deletes**: All user-facing tables have `deleted_at` timestamp
2. **UUID Primary Keys**: Avoids ID enumeration, better for distributed systems
3. **JSON Columns**: For flexible metadata (model params, workflow nodes)
4. **Audit Logging**: Tracks all critical actions for compliance
5. **Alembic Migrations**: Version-controlled schema changes

---

## Migration Management
```bash
# First, enable pgvector extension (run via psql)
psql -U postgres -d creativeforge -c "CREATE EXTENSION IF NOT EXISTS pgvector;"

# Generate migration for new memory tables
alembic revision --autogenerate -m "add memory engine tables (user_style_dna, creative_memory, emotion_profiles)"

# Run migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```
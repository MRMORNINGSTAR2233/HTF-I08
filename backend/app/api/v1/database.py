from typing import Any, List
import time
import pandas as pd
from sqlalchemy import create_engine, text
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.database import DatabaseConfig
from app.schemas.database import (
    DatabaseConfig as DatabaseConfigSchema,
    DatabaseConfigCreate,
    DatabaseConfigUpdate,
    QueryRequest,
    QueryResponse
)

router = APIRouter()

@router.post("/", response_model=DatabaseConfigSchema)
def create_database_config(
    *,
    db: Session = Depends(get_db),
    db_config_in: DatabaseConfigCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create new database configuration.
    """
    db_config = DatabaseConfig(
        name=db_config_in.name,
        db_type=db_config_in.db_type,
        host=db_config_in.host,
        port=db_config_in.port,
        username=db_config_in.username,
        password=db_config_in.password,
        database_name=db_config_in.database_name,
        file_path=db_config_in.file_path,
        user_id=current_user.id
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config


@router.get("/", response_model=List[DatabaseConfigSchema])
def get_database_configs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve database configurations for current user.
    """
    configs = db.query(DatabaseConfig).filter(
        DatabaseConfig.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return configs


@router.get("/{config_id}", response_model=DatabaseConfigSchema)
def get_database_config(
    *,
    db: Session = Depends(get_db),
    config_id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve specific database configuration by ID.
    """
    db_config = db.query(DatabaseConfig).filter(
        DatabaseConfig.id == config_id,
        DatabaseConfig.user_id == current_user.id
    ).first()
    if not db_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Database configuration not found"
        )
    return db_config


@router.put("/{config_id}", response_model=DatabaseConfigSchema)
def update_database_config(
    *,
    db: Session = Depends(get_db),
    config_id: int,
    db_config_in: DatabaseConfigUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update database configuration.
    """
    db_config = db.query(DatabaseConfig).filter(
        DatabaseConfig.id == config_id,
        DatabaseConfig.user_id == current_user.id
    ).first()
    if not db_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Database configuration not found"
        )
    
    # Update fields
    update_data = db_config_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_config, field, value)
        
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config


@router.delete("/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_database_config(
    *,
    db: Session = Depends(get_db),
    config_id: int,
    current_user: User = Depends(get_current_user)
) -> None:
    """
    Delete database configuration.
    """
    db_config = db.query(DatabaseConfig).filter(
        DatabaseConfig.id == config_id,
        DatabaseConfig.user_id == current_user.id
    ).first()
    if not db_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Database configuration not found"
        )
    
    db.delete(db_config)
    db.commit()


@router.post("/query", response_model=QueryResponse)
def execute_query(
    *,
    db: Session = Depends(get_db),
    query_request: QueryRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Execute a query against the specified database configuration.
    """
    # Get database configuration
    db_config = db.query(DatabaseConfig).filter(
        DatabaseConfig.id == query_request.db_config_id,
        DatabaseConfig.user_id == current_user.id
    ).first()
    if not db_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Database configuration not found"
        )
    
    start_time = time.time()
    results = []
    columns = []
    
    try:
        # Handle different database types
        if db_config.db_type == "postgresql":
            # Create connection string for PostgreSQL
            conn_str = f"postgresql://{db_config.username}:{db_config.password}@{db_config.host}:{db_config.port}/{db_config.database_name}"
            engine = create_engine(conn_str)
            with engine.connect() as connection:
                result = connection.execute(text(query_request.query))
                columns = result.keys()
                results = [dict(zip(columns, row)) for row in result.fetchall()]
                
        elif db_config.db_type == "mysql":
            # Create connection string for MySQL
            conn_str = f"mysql+pymysql://{db_config.username}:{db_config.password}@{db_config.host}:{db_config.port}/{db_config.database_name}"
            engine = create_engine(conn_str)
            with engine.connect() as connection:
                result = connection.execute(text(query_request.query))
                columns = result.keys()
                results = [dict(zip(columns, row)) for row in result.fetchall()]
        
        elif db_config.db_type == "csv":
            # Read CSV file using pandas
            df = pd.read_csv(db_config.file_path)
            # Execute query using pandas query if it's a filtering query
            if query_request.query.lower().startswith("select"):
                # Simple SQL-like query handling
                # This is a very simplified approach. In a real-world scenario,
                # you'd want to use a proper SQL parser
                columns = df.columns.tolist()
                results = df.to_dict('records')
            else:
                # Try to use pandas query syntax
                filtered_df = df.query(query_request.query)
                columns = filtered_df.columns.tolist()
                results = filtered_df.to_dict('records')
                
        elif db_config.db_type == "excel":
            # Read Excel file using pandas
            df = pd.read_excel(db_config.file_path)
            # Execute query using pandas query if it's a filtering query
            if query_request.query.lower().startswith("select"):
                # Simple SQL-like query handling
                columns = df.columns.tolist()
                results = df.to_dict('records')
            else:
                # Try to use pandas query syntax
                filtered_df = df.query(query_request.query)
                columns = filtered_df.columns.tolist()
                results = filtered_df.to_dict('records')
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported database type: {db_config.db_type}"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing query: {str(e)}"
        )
    
    execution_time = time.time() - start_time
    
    return {
        "results": results,
        "columns": list(columns),
        "execution_time": execution_time
    }
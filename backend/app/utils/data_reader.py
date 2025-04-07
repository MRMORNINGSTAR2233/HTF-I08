import pandas as pd
import sqlalchemy as sa
from typing import Dict, Any
import os
from sqlalchemy.orm import Session
from sqlalchemy import inspect, MetaData, text
from ..models.database import DatabaseConfig, DatabaseType
from ..config.r2_config import get_r2_client, R2_BUCKET_NAME
from ..api.NLtoSQL.AImodule import TextToSQL

class DataReader:
    @staticmethod
    async def get_preview(db_session: Session, db_config_id: int) -> Dict[str, Any]:
        try:
            db_config = db_session.query(DatabaseConfig).filter(DatabaseConfig.id == db_config_id).first()
            if not db_config:
                raise Exception("Database configuration not found")

            # Convert string to enum
            db_type = DatabaseType(db_config.db_type)

            if db_type in [DatabaseType.CSV, DatabaseType.EXCEL]:
                if not db_config.file_path:
                    raise Exception("File path is required for CSV/Excel sources")
                return await DataReader._read_file_preview(db_config, db_type)
            elif db_type in [DatabaseType.MYSQL, DatabaseType.POSTGRESQL]:
                if not all([db_config.host, db_config.port, db_config.database_name]):
                    raise Exception("Missing required database connection details")
                return await DataReader._read_db_preview(db_config, db_type)
            else:
                raise Exception(f"Unsupported database type: {db_type}")
        except Exception as e:
            raise Exception(f"Error reading file {db_config.file_path}: {str(e)}")

    @staticmethod
    async def _read_file_preview(db_config: DatabaseConfig, db_type: DatabaseType) -> Dict[str, Any]:
        try:
            r2_client = get_r2_client()
            response = r2_client.get_object(Bucket=R2_BUCKET_NAME, Key=db_config.file_path)
            content = response['Body'].read()
            
            if db_type == DatabaseType.CSV:
                df = pd.read_csv(pd.io.common.BytesIO(content))
            else:  # EXCEL
                df = pd.read_excel(pd.io.common.BytesIO(content))
            
            return {
                "source_type": "file",
                "name": db_config.name,
                "file_type": db_type.value,
                "preview": DataReader._get_preview_data(df)
            }
        except Exception as e:
            raise Exception(f"Error reading file {db_config.file_path}: {str(e)}")

    @staticmethod
    async def _read_db_preview(db_config: DatabaseConfig, db_type: DatabaseType) -> Dict[str, Any]:
        try:
            # Use PyMySQL for MySQL connections
            if db_type == DatabaseType.MYSQL:
                conn_str = f"mysql+pymysql://{db_config.username}:{db_config.password}@{db_config.host}:{db_config.port}/{db_config.database_name}"
            else:
                conn_str = f"{db_type.value}://{db_config.username}:{db_config.password}@{db_config.host}:{db_config.port}/{db_config.database_name}"

            engine = sa.create_engine(conn_str)
            inspector = inspect(engine)
            tables = inspector.get_table_names()

            if not tables:
                return {
                    "source_type": "database",
                    "name": db_config.name,
                    "database_type": db_type.value,
                    "database_name": db_config.database_name,
                    "connection_info": {"host": db_config.host, "port": db_config.port},
                    "schema": {},
                    "statistics": {},
                    "preview": {
                        "columns": [],
                        "data_sample": [],
                        "total_rows": 0,
                        "data_types": {}
                    }
                }

            schema_info = {}
            table_stats = {}

            # Get schema information first
            for table_name in tables:
                columns = inspector.get_columns(table_name)
                pk_constraint = inspector.get_pk_constraint(table_name)
                foreign_keys = inspector.get_foreign_keys(table_name)
                indexes = inspector.get_indexes(table_name)
                unique_constraints = inspector.get_unique_constraints(table_name)

                schema_info[table_name] = {
                    "columns": {
                        col['name']: {
                            "type": str(col['type']),
                            "nullable": col.get('nullable', True),
                            "default": str(col.get('default', None)) if col.get('default') is not None else None,
                            "primary_key": col['name'] in (pk_constraint.get('constrained_columns', []) if pk_constraint else [])
                        } for col in columns
                    },
                    "constraints": {
                        "primary_key": pk_constraint.get('constrained_columns', []) if pk_constraint else [],
                        "foreign_keys": [{
                            "constrained_columns": fk['constrained_columns'],
                            "referred_table": fk['referred_table'],
                            "referred_columns": fk['referred_columns']
                        } for fk in foreign_keys],
                        "unique_constraints": [{
                            "name": uc.get('name'),
                            "columns": uc.get('column_names', [])
                        } for uc in unique_constraints]
                    },
                    "indexes": [{
                        "name": idx.get('name'),
                        "columns": idx.get('column_names', []),
                        "unique": idx.get('unique', False)
                    } for idx in indexes]
                }

            # Get statistics and sample data in separate connections
            for table_name in tables:
                with engine.connect() as connection:
                    try:
                        # Get row count
                        count_query = f'SELECT COUNT(*) as count FROM "{table_name}"'
                        row_count = connection.execute(text(count_query)).scalar()

                        # Get sample rows
                        sample_query = f'SELECT * FROM "{table_name}" LIMIT 5'
                        sample_df = pd.read_sql(sample_query, connection)
                        
                        # Basic column statistics
                        columns = schema_info[table_name]["columns"].keys()
                        stats = {}
                        
                        for col in columns:
                            try:
                                if db_type == DatabaseType.POSTGRESQL:
                                    stats_query = f"""
                                        SELECT 
                                            COUNT(DISTINCT "{col}") as unique_count,
                                            MIN("{col}") as min_value,
                                            MAX("{col}") as max_value
                                        FROM "{table_name}"
                                    """
                                else:
                                    stats_query = f"""
                                        SELECT 
                                            COUNT(DISTINCT `{col}`) as unique_count,
                                            MIN(`{col}`) as min_value,
                                            MAX(`{col}`) as max_value
                                        FROM `{table_name}`
                                    """
                                col_stats = connection.execute(text(stats_query)).fetchone()
                                stats[col] = {
                                    "unique_count": col_stats[0],
                                    "min_value": str(col_stats[1]) if col_stats[1] is not None else None,
                                    "max_value": str(col_stats[2]) if col_stats[2] is not None else None
                                }
                            except Exception:
                                stats[col] = {"unique_count": None, "min_value": None, "max_value": None}

                        # Update schema with statistics
                        for col in columns:
                            schema_info[table_name]["columns"][col]["stats"] = stats[col]

                        table_stats[table_name] = {
                            "row_count": row_count,
                            "sample_rows": sample_df.to_dict('records')
                        }

                    except Exception as e:
                        table_stats[table_name] = {
                            "row_count": 0,
                            "sample_rows": [],
                            "error": str(e)
                        }

            # Create preview data from first table
            first_table = tables[0]
            first_table_stats = table_stats[first_table]
            preview_data = {
                "columns": list(schema_info[first_table]["columns"].keys()),
                "data_sample": first_table_stats["sample_rows"],
                "total_rows": first_table_stats["row_count"],
                "data_types": {
                    col: schema_info[first_table]["columns"][col]["type"]
                    for col in schema_info[first_table]["columns"]
                }
            }

            return {
                "source_type": "database",
                "name": db_config.name,
                "database_type": db_type.value,
                "database_name": db_config.database_name,
                "connection_info": {
                    "host": db_config.host,
                    "port": db_config.port
                },
                "schema": schema_info,
                "statistics": table_stats,
                "preview": preview_data
            }

        except Exception as e:
            raise Exception(f"Error connecting to database: {str(e)}")

    @staticmethod
    def _get_preview_data(df: pd.DataFrame) -> Dict[str, Any]:
        preview_df = df.head(5)
        return {
            "columns": list(df.columns),
            "data_sample": preview_df.to_dict('records'),
            "total_rows": len(df),
            "data_types": {col: str(dtype) for col, dtype in df.dtypes.items()}
        }

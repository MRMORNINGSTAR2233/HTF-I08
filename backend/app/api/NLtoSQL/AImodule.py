import os
from typing import Dict, Any, Optional
from sqlalchemy import create_engine, inspect, text
import functools
import time
# from openai import OpenAI
import psycopg2
from groq import Groq
import pymysql
import sqlite3

class TextToSQL:
    def __init__(self, connection_string: str):
        """
        Initialize the Text-to-SQL converter with support for multiple database types.
        
        Args:
            connection_string: SQLAlchemy connection string for the database
            Examples:
            - PostgreSQL: "postgresql://user:pass@host:port/dbname"
            - MySQL/MariaDB: "mysql+pymysql://user:pass@host:port/dbname"
            - SQLite: "sqlite:///path/to/database.db"
        """
        self.connection_string = connection_string
        
        # Detect database type and set appropriate driver
        if "postgresql" in connection_string.lower() or "postgres" in connection_string.lower():
            try:
                import psycopg2
                # Ensure the connection string uses the correct dialect
                if not connection_string.startswith("postgresql://"):
                    connection_string = connection_string.replace("postgres://", "postgresql://")
                self.engine = create_engine(connection_string)
            except ImportError:
                raise ImportError("Please install psycopg2: pip install psycopg2-binary")
        elif "mysql" in connection_string.lower() or "maria" in connection_string.lower():
            try:
                import pymysql
                self.engine = create_engine(connection_string)
            except ImportError:
                raise ImportError("Please install pymysql: pip install pymysql")
        elif "sqlite" in connection_string.lower():
            try:
                import sqlite3
                self.engine = create_engine(connection_string)
            except ImportError:
                raise ImportError("Please install sqlite3: pip install sqlite3")
        else:
            raise ValueError("Unsupported database type. Please use PostgreSQL, MySQL/MariaDB, or SQLite.")
        
        # Test connection
        try:
            with self.engine.connect() as conn:
                pass
        except Exception as e:
            raise ConnectionError(f"Could not connect to database: {str(e)}")
        
        # Initialize OpenRouter client
        self._init_openrouter()
        
        # Cache for schema info
        self._schema_cache = None
        self._schema_cache_timestamp = 0
        self._schema_cache_ttl = 300  # 5 minutes TTL for schema cache
    
    def _init_openrouter(self):
        """Initialize OpenRouter client."""
        self.openrouter_client = Groq(
            api_key="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",
        )
    
    def _clean_sql_query(self, sql_query: str) -> str:
        """
        Clean the SQL query by removing markdown formatting and extra whitespace.
        """
        # Remove markdown code block formatting
        sql_query = sql_query.replace('sql', '').replace('```', '')
        
        # Remove any leading/trailing whitespace and newlines
        sql_query = sql_query.strip()
        
        # Ensure the query ends with a semicolon
        if not sql_query.endswith(';'):
            sql_query += ';'
            
        return sql_query

    def _generate_sql(self, query: str, schema: str) -> str:
        """
        Generate SQL from natural language using OpenRouter with enhanced schema awareness.
        """
        try:
            # Prepare the prompt with detailed schema information
            prompt = (
                "You are a SQL expert. Given an input question, create a syntactically correct SQL query.\n"
                "IMPORTANT RULES:\n"
                "1. ONLY use tables and columns that exist in the schema below\n"
                "2. Use proper JOIN conditions based on the relationships shown\n"
                "3. Include relevant columns in the output, especially IDs and descriptive fields\n"
                "4. Use appropriate aggregations (COUNT, SUM, AVG, etc.) when asked for summaries\n"
                "5. Add ORDER BY for any TOP/BOTTOM queries\n"
                "6. Use GROUP BY with any aggregation functions\n"
                "7. Use table aliases to avoid ambiguity\n"
                "8. Add LIMIT only when specifically asked for a number of results\n"
                "9. Use appropriate WHERE conditions to filter data\n"
                "10. Return 'SELECT NULL LIMIT 0' if the query cannot be answered with the available schema\n"
                "11. Return ONLY the SQL query without any markdown formatting or explanations\n\n"
                "DATABASE SCHEMA:\n"
                f"{schema}\n\n"
                f"QUESTION: {query}\n\n"
                f"Write a {self.engine.dialect.name} SQL query that answers this question.\n"
                "SQL QUERY:"
            )
            
            # Make the API call with proper error handling
            try:
                response = self.openrouter_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": "You are a SQL expert that writes precise, efficient queries based strictly on the provided schema. Return ONLY the SQL query without any markdown formatting or explanations."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0,
                    max_tokens=500
                )
                
                if not response or not response.choices:
                    print("Error: Empty response from OpenRouter")
                    return "SELECT NULL LIMIT 0;"
                    
                sql_query = response.choices[0].message.content.strip()
                
                # Clean the SQL query
                sql_query = self._clean_sql_query(sql_query)
                
                # Validate if the query is empty or indicates no results
                if not sql_query or sql_query.lower() == 'no results found':
                    return "SELECT NULL LIMIT 0;"
                    
                return sql_query
                
            except Exception as api_error:
                print(f"OpenRouter API Error: {str(api_error)}")
                return "SELECT NULL LIMIT 0;"
            
        except Exception as e:
            print(f"Error in SQL generation: {str(e)}")
            return "SELECT NULL LIMIT 0;"
    
    def get_table_info(self) -> Dict[str, Dict[str, Any]]:
        """
        Get information about all tables and their schema from the database.
        Optimized for different database types.
        """
        # Check if we have a valid cached schema
        current_time = time.time()
        if self._schema_cache and (current_time - self._schema_cache_timestamp) < self._schema_cache_ttl:
            return self._schema_cache
            
        tables = {}
        dialect_name = self.engine.dialect.name.lower()
        
        try:
            with self.engine.connect() as conn:
                if "postgres" in dialect_name:
                    # PostgreSQL schema query
                    query = text("""
                        SELECT 
                            t.table_name,
                            c.column_name,
                            c.data_type,
                            c.is_nullable,
                            CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN 'YES' ELSE 'NO' END as is_primary
                        FROM 
                            information_schema.tables t
                        JOIN 
                            information_schema.columns c ON t.table_name = c.table_name
                        LEFT JOIN 
                            information_schema.table_constraints tc 
                            ON t.table_name = tc.table_name 
                            AND tc.constraint_type = 'PRIMARY KEY'
                        LEFT JOIN 
                            information_schema.key_column_usage kcu 
                            ON tc.constraint_name = kcu.constraint_name 
                            AND c.column_name = kcu.column_name
                        WHERE 
                            t.table_schema = 'public'
                        ORDER BY 
                            t.table_name, c.ordinal_position;
                    """)
                elif "mysql" in dialect_name or "maria" in dialect_name:
                    # MySQL/MariaDB schema query
                    query = text("""
                        SELECT 
                            table_name,
                            column_name,
                            data_type,
                            is_nullable,
                            column_key
                        FROM 
                            information_schema.columns 
                        WHERE 
                            table_schema = DATABASE()
                        ORDER BY 
                            table_name, ordinal_position;
                    """)
                else:
                    # SQLite schema query
                    query = text("""
                        SELECT 
                            name as table_name
                        FROM 
                            sqlite_master 
                        WHERE 
                            type='table' 
                            AND name NOT LIKE 'sqlite_%'
                    """)
                
                result = conn.execute(query)
                
                if "postgres" in dialect_name:
                    for row in result:
                        table_name = row.table_name
                        if table_name not in tables:
                            tables[table_name] = {"columns": {}}
                        tables[table_name]["columns"][row.column_name] = {
                            "type": row.data_type,
                            "nullable": row.is_nullable == "YES",
                            "primary_key": row.is_primary == "YES"
                        }
                elif "mysql" in dialect_name or "maria" in dialect_name:
                    for row in result:
                        table_name = row.table_name
                        if table_name not in tables:
                            tables[table_name] = {"columns": {}}
                        tables[table_name]["columns"][row.column_name] = {
                            "type": row.data_type,
                            "nullable": row.is_nullable == "YES",
                            "primary_key": row.column_key == "PRI"
                        }
                else:
                    # SQLite schema handling
                    for row in result:
                        table_name = row.table_name
                        tables[table_name] = {"columns": {}}
                        
                        # Get columns for each table
                        columns_query = text(f"PRAGMA table_info({table_name})")
                        columns_result = conn.execute(columns_query)
                        
                        for col in columns_result:
                            tables[table_name]["columns"][col.name] = {
                                "type": col.type,
                                "nullable": not col.notnull,
                                "primary_key": col.pk == 1
                            }
                
                # Update the cache
                self._schema_cache = tables
                self._schema_cache_timestamp = current_time
                
                return tables
                
        except Exception as e:
            print(f"Error getting table info: {e}")
            return {}
    
    def _format_schema_for_prompt(self) -> str:
        """Format the database schema in a concise way for the LLM prompt."""
        tables = self.get_table_info()
        schema_str = []
        
        # First, collect all table information
        for table_name, table_info in tables.items():
            columns = []
            primary_keys = []
            for col_name, col_info in table_info["columns"].items():
                col_type = col_info['type']
                constraints = []
                
                if col_info["primary_key"]:
                    primary_keys.append(col_name)
                    constraints.append("PRIMARY KEY")
                if not col_info["nullable"]:
                    constraints.append("NOT NULL")
                
                constraint_str = " " + " ".join(constraints) if constraints else ""
                columns.append(f"  {col_name} {col_type}{constraint_str}")
            
            schema_str.append(f"CREATE TABLE {table_name} (\n" + ",\n".join(columns) + "\n);")
        
        # Add table relationships based on primary/foreign keys
        relationships = self._get_table_relationships()
        if relationships:
            schema_str.append("\n-- Table Relationships:")
            for rel in relationships:
                schema_str.append(f"-- {rel}")
        
        return "\n\n".join(schema_str)

    def _get_table_relationships(self) -> list:
        """Extract table relationships from the database schema."""
        relationships = []
        try:
            with self.engine.connect() as conn:
                dialect_name = self.engine.dialect.name.lower()
                
                if "postgres" in dialect_name:
                    # PostgreSQL relationship query
                    query = text("""
                        SELECT
                            tc.table_schema, 
                            tc.constraint_name, 
                            tc.table_name, 
                            kcu.column_name, 
                            ccu.table_name AS foreign_table_name,
                            ccu.column_name AS foreign_column_name 
                        FROM 
                            information_schema.table_constraints AS tc 
                            JOIN information_schema.key_column_usage AS kcu
                              ON tc.constraint_name = kcu.constraint_name
                            JOIN information_schema.constraint_column_usage AS ccu
                              ON ccu.constraint_name = tc.constraint_name
                        WHERE tc.constraint_type = 'FOREIGN KEY';
                    """)
                elif "mysql" in dialect_name or "maria" in dialect_name:
                    # MySQL/MariaDB relationship query
                    query = text("""
                        SELECT 
                            TABLE_NAME,
                            COLUMN_NAME,
                            REFERENCED_TABLE_NAME,
                            REFERENCED_COLUMN_NAME
                        FROM
                            INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                        WHERE
                            REFERENCED_TABLE_NAME IS NOT NULL
                            AND TABLE_SCHEMA = DATABASE()
                    """)
                else:
                    # SQLite relationship query
                    query = text("""
                        SELECT 
                            m.name as table_name,
                            p.name as column_name,
                            p.\"from\" as referenced_table,
                            p.\"to\" as referenced_column
                        FROM 
                            sqlite_master m
                        JOIN 
                            pragma_foreign_key_list(m.name) p
                        WHERE 
                            m.type = 'table'
                    """)
                
                result = conn.execute(query)
                for row in result:
                    if "postgres" in dialect_name:
                        relationships.append(
                            f"{row.table_name}.{row.column_name} -> "
                            f"{row.foreign_table_name}.{row.foreign_column_name}"
                        )
                    elif "mysql" in dialect_name or "maria" in dialect_name:
                        relationships.append(
                            f"{row.TABLE_NAME}.{row.COLUMN_NAME} -> "
                            f"{row.REFERENCED_TABLE_NAME}.{row.REFERENCED_COLUMN_NAME}"
                        )
                    else:  # SQLite
                        relationships.append(
                            f"{row.table_name}.{row.column_name} -> "
                            f"{row.referenced_table}.{row.referenced_column}"
                        )
        except Exception as e:
            print(f"Warning: Could not fetch relationships: {e}")
        return relationships
    
    def natural_language_to_sql(self, query: str) -> Dict[str, Any]:
        """
        Convert natural language to SQL without executing it.
        
        Args:
            query: Natural language query
            
        Returns:
            Dict containing:
                - sql_query: Generated SQL query
                - error: Error message if any
        """
        try:
            # Format the schema for the prompt
            schema = self._format_schema_for_prompt()
            
            # Generate SQL with direct OpenRouter call
            sql_query = self._generate_sql(query, schema)
            
            if not sql_query:
                return {
                    "sql_query": None,
                    "error": "Failed to generate SQL query"
                }
            
            return {
                "sql_query": sql_query,
                "error": None
            }
            
        except Exception as e:
            print(f"Error in natural_language_to_sql: {str(e)}")
            return {
                "sql_query": None,
                "error": str(e)
            }
    
    def execute_query(self, query: str) -> Dict[str, Any]:
        """
        Execute a natural language query and return structured results.
        """
        try:
            # First get the SQL query
            sql_result = self.natural_language_to_sql(query)
            if sql_result["error"]:
                return {
                    "sql_query": None,
                    "data": [],
                    "columns": [],
                    "total_rows": 0,
                    "summary": None,
                    "error": sql_result["error"]
                }
            
            # Clean the SQL query before execution
            clean_sql = self._clean_sql_query(sql_result["sql_query"])
            
            # Execute the SQL query using SQLAlchemy text()
            with self.engine.connect() as conn:
                result = conn.execute(text(clean_sql))
                
                # Get column names
                columns = list(result.keys())
                
                # Convert results to list of dictionaries
                results = [dict(zip(columns, row)) for row in result]
                
                if not results:
                    return {
                        "sql_query": clean_sql,
                        "data": [],
                        "columns": columns,
                        "total_rows": 0,
                        "summary": "No results found",
                        "error": None
                    }

                # Generate a simple summary of the results
                summary = f"Query returned {len(results)} results with columns: {', '.join(columns)}"
                
                # Return structured data without visualization
                return {
                    "sql_query": clean_sql,
                    "data": results,
                    "columns": columns,
                    "total_rows": len(results),
                    "summary": summary,
                    "error": None
                }
                
        except Exception as e:
            print(f"Error in execute_query: {str(e)}")
            return {
                "sql_query": None,
                "data": [],
                "columns": [],
                "total_rows": 0,
                "summary": None,
                "error": str(e)
            }
    
    def _infer_d3_type(self, results: list, column: str) -> str:
        """Helper method to infer D3-compatible data types."""
        if not results:
            return "string"
            
        sample = results[0][column]
        if isinstance(sample, (int, float)):
            return "number"
        elif isinstance(sample, bool):
            return "boolean"
        elif isinstance(sample, (str, bytes)):
            # Check if it might be a date
            if any(date_indicator in column.lower() for date_indicator in ['date', 'time', 'created', 'updated']):
                return "date"
        return "string"

    def _suggest_basic_chart_type(self, results: list, column_types: dict) -> str:
        """Suggest a basic chart type based on the data structure."""
        num_numeric = sum(1 for t in column_types.values() if t == "number")
        num_categorical = sum(1 for t in column_types.values() if t != "number")
        num_rows = len(results)
        
        if num_rows == 0:
            return "barChart"
            
        if "date" in column_types.values():
            return "lineChart"
        elif num_numeric >= 2:
            return "scatterPlot"
        elif num_categorical > 0 and num_numeric > 0:
            return "barChart"
        elif num_categorical > 0 and num_rows <= 10:
            return "pieChart"
        else:
            return "barChart"

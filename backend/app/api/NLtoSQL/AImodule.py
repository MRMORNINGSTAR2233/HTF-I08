import os
from typing import Dict, Any, Optional
from sqlalchemy import create_engine, inspect, text
import functools
import time
from openai import OpenAI

class TextToSQL:
    def __init__(self, connection_string: str):
        """
        Initialize the Text-to-SQL converter
        
        Args:
            connection_string: SQLAlchemy connection string for the database
            Examples:
            - SQLite: "sqlite:///database.db"
            - PostgreSQL: "postgresql://user:password@localhost:5432/dbname"
            - MySQL/MariaDB: "mysql+pymysql://user:password@localhost:3306/dbname"
        """
        self.connection_string = connection_string
        
        # Create SQLAlchemy engine
        self.engine = create_engine(connection_string)
        
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
        self.openrouter_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key="API_KEY"
        )
    
    def _generate_sql(self, query: str, schema: str) -> str:
        """
        Generate SQL from natural language using OpenRouter directly.
        """
        # Prepare the prompt
        prompt = (
            "You are a SQL expert. Given an input question, create a syntactically correct SQL query to run.\n"
            "Use the schema below to create your query:\n"
            f"{schema}\n\n"
            f"Input question: {query}\n\n"
            "IMPORTANT: Return ONLY the SQL query without any explanations, comments, or markdown formatting.\n"
            "Follow these rules to make your query more useful:\n"
            "1. Always include primary key/ID columns in SELECT statements\n"
            "2. Include descriptive columns that help identify the records (names, titles, dates, etc.)\n"
            "3. For aggregate queries, include grouping fields in the result\n"
            "4. When filtering or searching, return enough context columns for the results to be meaningful\n"
            "5. Limit results only when explicitly asked, otherwise return complete datasets\n"
            "6. Use appropriate joins to include related information when relevant\n"
            "7. IMPORTANT: When using table aliases, always verify each column belongs to the correct table\n"
            "8. Do not reference columns that don't exist in the tables - check the schema carefully\n"
            "9. Prefer using descriptive table aliases (like 'products p' instead of 'products T1')\n"
            "10. Always respect the actual column structure of each table in the schema\n"
            "11. If the querry cannot be answered, return 'No results found'\n"
            f"Make sure to use SQL syntax compatible with {self.engine.dialect.name}.\n"
            "SQL query: "
        )
        
        # Direct call to OpenRouter
        try:
            response = self.openrouter_client.chat.completions.create(
                model="meta-llama/llama-4-maverick:free",
                messages=[{"role": "user", "content": prompt}],
                temperature=0
            )
            sql_query = response.choices[0].message.content.strip()
            return sql_query
            
        except Exception as e:
            print(f"Error generating SQL: {str(e)}")
            return ""
    
    def get_table_info(self) -> Dict[str, Dict[str, Any]]:
        """
        Get information about all tables and their schema from the database.
        Optimized for MySQL databases.
        """
        # Check if we have a valid cached schema
        current_time = time.time()
        if self._schema_cache and (current_time - self._schema_cache_timestamp) < self._schema_cache_ttl:
            return self._schema_cache
            
        tables = {}
        
        # Optimized schema extraction based on database type
        dialect_name = self.engine.dialect.name.lower()
        
        if "mysql" in dialect_name or "maria" in dialect_name:
            # Optimized for MySQL/MariaDB - direct SQL query is much faster than using inspect
            with self.engine.connect() as conn:
                # Get database name
                database_name_query = text("SELECT DATABASE()")
                database_name = conn.execute(database_name_query).scalar()
                
                # Get all tables
                table_query = text(f"""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = '{database_name}'
                """)
                table_names = [row[0] for row in conn.execute(table_query)]
                
                # For each table, get column information
                for table_name in table_names:
                    columns_query = text(f"""
                        SELECT 
                            column_name, 
                            data_type, 
                            is_nullable, 
                            column_key
                        FROM information_schema.columns 
                        WHERE table_schema = '{database_name}' 
                        AND table_name = '{table_name}'
                        ORDER BY ordinal_position
                    """)
                    
                    tables[table_name] = {"columns": {}}
                    for column_name, data_type, is_nullable, column_key in conn.execute(columns_query):
                        tables[table_name]["columns"][column_name] = {
                            "type": data_type,
                            "nullable": is_nullable == "YES",
                            "primary_key": column_key == "PRI"
                        }
        else:
            # Fallback to SQLAlchemy Inspector for other databases
            inspector = inspect(self.engine)
            table_names = inspector.get_table_names()
            
            # Process all tables
            for table_name in table_names:
                tables[table_name] = {"columns": {}}
                
                # Get primary key info
                pk_info = inspector.get_pk_constraint(table_name)
                pk_columns = pk_info.get('constrained_columns', []) if pk_info else []
                
                # Get all columns at once for each table
                columns = inspector.get_columns(table_name)
                for column in columns:
                    tables[table_name]["columns"][column['name']] = {
                        "type": str(column['type']),
                        "nullable": column.get('nullable', True),
                        "primary_key": column['name'] in pk_columns
                    }
        
        # Update the cache
        self._schema_cache = tables
        self._schema_cache_timestamp = current_time
        
        return tables
    
    def _format_schema_for_prompt(self) -> str:
        """Format the database schema in a concise way for the LLM prompt."""
        tables = self.get_table_info()
        schema_str = []
        
        for table_name, table_info in tables.items():
            columns = []
            for col_name, col_info in table_info["columns"].items():
                pk_str = " PRIMARY KEY" if col_info["primary_key"] else ""
                null_str = " NOT NULL" if not col_info["nullable"] else ""
                columns.append(f"  {col_name} {col_info['type']}{pk_str}{null_str}")
            
            schema_str.append(f"CREATE TABLE {table_name} (\n" + ",\n".join(columns) + "\n);")
        
        return "\n\n".join(schema_str)
    
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
            
            return {
                "sql_query": sql_query,
                "error": None
            }
        except Exception as e:
            return {
                "sql_query": None,
                "error": str(e)
            }

# def main():
#     """Demo function to test the Text-to-SQL converter."""
#     # Example connection strings
#     connections = {
#         # "sqlite": "sqlite:///customer_db.sqlite",
#         "mysql": "mysql+pymysql://rfamro@mysql-rfam-public.ebi.ac.uk:4497/Rfam",
#         # "mariadb": "mariadb+pymysql://guest:ctu-relational@relational.fel.cvut.cz:3306/classicmodels"
#     }
    
#     # Use SQLite for demo
#     text_to_sql = TextToSQL(connections["mysql"])
    
#     # Print database schema information
#     tables = text_to_sql.get_table_info()
#     print("Database Schema:")
#     for table_name, table_info in tables.items():
#         print(f"Table: {table_name}")
#         for column, details in table_info['columns'].items():
#             pk = " (PK)" if details['primary_key'] else ""
#             null = "" if details['nullable'] else " NOT NULL"
#             print(f"  - {column}: {details['type']}{pk}{null}")
    
#     # Sample queries to test
#     test_queries = [
#         "Show me all customers from New York",
#         "What are the top 5 customers by total purchases?",
#         "List all orders with total amount greater than 1000",
#         "How many orders does each customer have?",
#         "Show me products in the Electronics category with price less than 500",
#         "Find customers who have placed more than 3 orders"
#     ]
    
#     # Test each query
#     print("\nTesting queries:")
#     for i, query in enumerate(test_queries, 1):
#         print(f"\n[Query {i}]: {query}")
        
#         result = text_to_sql.natural_language_to_sql(query)
        
#         if result["error"]:
#             print(f"Error: {result['error']}")
#         else:
#             print(f"SQL: {result['sql_query']}")

# if __name__ == "__main__":
#     main() 

from typing import Dict, Any, List
from datetime import datetime, date
from groq import Groq
from sqlalchemy.orm import Session
from ..models.chat import Chat, ConfigType
from ..models.database import DatabaseConfig
from ..utils.data_reader import DataReader
from ..api.v1.database import execute_query
from ..schemas.database import QueryRequest
from ..models.user import User
from ..core.config import settings
import json
import pandas as pd
from ..api.NLtoSQL.AImodule import TextToSQL
from ..config.r2_config import get_r2_client, R2_BUCKET_NAME
from fastapi import HTTPException
import httpx
import decimal


# Enhanced JSON encoder for handling various non-serializable types
class EnhancedJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        elif isinstance(obj, (datetime, date)):
            return obj.isoformat()
        elif hasattr(obj, 'to_dict'):
            return obj.to_dict()
        return super(EnhancedJSONEncoder, self).default(obj)

class ChatService:
    def __init__(self):
        self.client = Groq(
            api_key="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",
        )

    def create_chat(self, db: Session, user_id: int, name: str, config_id: int, config_type: str) -> Chat:
        chat = Chat(
            name=name,
            config_id=config_id,
            user_id=user_id,
            config_type=config_type,
            conversation=[]
        )
        db.add(chat)
        db.commit()
        db.refresh(chat)
        return chat

    def _format_messages(self, system_message: str, conversation: list, current_message: str) -> List[Dict]:
        """Format messages for LLM consumption"""
        messages = [{"role": "system", "content": system_message}]
        
        # Add conversation history
        if conversation:
            for msg in conversation[-5:]:  # Last 5 messages
                if isinstance(msg, dict) and "role" in msg and "content" in msg:
                    content = msg["content"]
                    if isinstance(content, dict):
                        # Handle structured message content
                        messages.append({
                            "role": msg["role"],
                            "content": content.get("thought", str(content))
                        })
                    else:
                        messages.append({
                            "role": msg["role"],
                            "content": str(content)
                        })

        # Add current message
        messages.append({"role": "user", "content": current_message})
        return messages

    async def query_data(self, db: Session, chat_id: int, message: str) -> Dict[str, Any]:
        try:
            chat = db.query(Chat).filter(Chat.id == chat_id).first()
            if not chat:
                raise Exception("Chat not found")

            config = db.query(DatabaseConfig).filter(DatabaseConfig.id == chat.config_id).first()
            if not config:
                raise Exception("Configuration not found")

            # Initialize conversation
            if chat.conversation is None:
                chat.conversation = []

            # Get schema info and build messages
            schema_info = await DataReader.get_preview(db, config.id)
            system_message = self._build_system_message(config, schema_info)
            messages = self._format_messages(system_message, chat.conversation, message)

            try:
                # Check if the message is a conversational query or a data query
                is_data_query = self._is_data_query(message, schema_info)
                
                # Agentic loop
                while True:
                    # Get response from LLM with appropriate tool choice
                    response = self.client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=messages,
                        tools=[
                            {
                                "type": "function",
                                "function": {
                                    "name": "query_database",
                                    "description": "Execute SQL query on the database",
                                    "parameters": {
                                        "type": "object",
                                        "properties": {
                                            "query": {
                                                "type": "string",
                                                "description": "SQL query to execute"
                                            }
                                        },
                                        "required": ["query"]
                                    }
                                }
                            }
                        ],
                        tool_choice="auto"
                    )

                    assistant_message = response.choices[0].message
                    print(f"Debug - Assistant message: {assistant_message}")
                    
                    # Process tool calls if present
                    # Debug the full response structure
                    print(f"Full response structure: {response}")
                    
                    # Check for tool_calls in different possible formats
                    tool_calls = None
                    if hasattr(assistant_message, 'tool_calls') and assistant_message.tool_calls:
                        tool_calls = assistant_message.tool_calls
                        print(f"Found tool_calls attribute: {tool_calls}")
                    elif isinstance(assistant_message, dict) and 'tool_calls' in assistant_message:
                        tool_calls = assistant_message['tool_calls']
                        print(f"Found tool_calls in dict: {tool_calls}")
                    
                    if tool_calls and len(tool_calls) > 0:
                        # Handle different possible formats of tool_calls
                        tool_call = tool_calls[0]
                        
                        # Extract function name and arguments based on structure
                        if hasattr(tool_call, 'function'):
                            # Object-style access
                            if hasattr(tool_call.function, 'name'):
                                tool_name = tool_call.function.name
                            else:
                                tool_name = tool_call.function.get('name')
                                
                            if hasattr(tool_call.function, 'arguments'):
                                args_str = tool_call.function.arguments
                            else:
                                args_str = tool_call.function.get('arguments', '{}')
                        elif isinstance(tool_call, dict) and 'function' in tool_call:
                            # Dict-style access
                            tool_name = tool_call['function'].get('name')
                            args_str = tool_call['function'].get('arguments', '{}')
                        else:
                            print(f"Unexpected tool_call format: {tool_call}")
                            raise Exception("Unable to parse tool call format")
                        
                        print(f"Tool name: {tool_name}, Args string: {args_str}")
                        
                        # Parse arguments safely
                        try:
                            args = json.loads(args_str)
                        except json.JSONDecodeError as e:
                            print(f"Error parsing tool arguments: {e}, args_str: {args_str}")
                            args = {}
                        
                        if tool_name == "query_database" and "query" in args:
                            query = args.get("query")
                            try:
                                # Create proper QueryRequest object
                                query_request = QueryRequest(
                                    db_config_id=config.id,
                                    query=query
                                )

                                # Get actual User object from database
                                user = db.query(User).filter(User.id == chat.user_id).first()
                                if not user:
                                    raise Exception(f"User with id {chat.user_id} not found")

                                # Execute query - add error handling
                                result = execute_query(
                                    db=db,
                                    query_request=query_request,
                                    current_user=user
                                )
                                
                                # Verify result structure before using it
                                if not result or not isinstance(result, dict):
                                    raise Exception("Invalid query result format")
                                    
                                # Get result fields with safe defaults
                                columns = result.get("columns", [])
                                results_data = result.get("results", [])
                                execution_time = result.get("execution_time", 0.0)
                                
                                # Format response with safe access to fields and custom encoder
                                formatted_result = {
                                    "query_type": "sql",
                                    "sql": query,
                                    "columns": columns,
                                    "data": results_data,
                                    "total_rows": len(results_data),
                                    "execution_time": execution_time
                                }
                                
                                # Add results to messages with enhanced encoder
                                messages.append({
                                    "role": "assistant",
                                    "content": assistant_message.content
                                })
                                messages.append({
                                    "role": "function",
                                    "name": "query_database",
                                    "content": json.dumps(formatted_result, cls=EnhancedJSONEncoder)
                                })
                                
                                # Update conversation and prepare response
                                response_content = {
                                    "thought": assistant_message.content,
                                    "query": query,
                                    "result": formatted_result,
                                    "data": results_data
                                }
                                break
                            except Exception as query_error:
                                print(f"Query execution error: {str(query_error)}")
                                # Provide a more useful error response
                                response_content = {
                                    "thought": assistant_message.content,
                                    "query": query,
                                    "result": {"error": str(query_error)},
                                    "data": []
                                }
                            break
                        
                        # We've removed the natural_language_to_sql_with_viz tool to simplify
                    else:
                        # No tool calls or empty tool_calls, just conversation
                        print(f"Debug - No tool calls detected or empty tool_calls")
                        # Check if content is None and provide a fallback
                        content = assistant_message.content if assistant_message.content else "I couldn't process your request properly. Please try again."
                        response_content = {
                            "thought": content,
                            "query": None,
                            "result": None,
                            "data": []
                        }
                        break

                # Update chat history with structured data and serialized timestamps
                chat.conversation = chat.conversation or []  # Initialize if None
                
                # Add user message with serialized timestamp
                chat.conversation.append({
                    "role": "user",
                    "content": {"text": message},
                    "timestamp": datetime.now().isoformat()
                })

                # Add assistant response with serialized timestamp
                chat.conversation.append({
                    "role": "assistant",
                    "content": {
                        "thought": response_content.get("thought"),
                        "query": response_content.get("query"),
                        "result": response_content.get("result"),
                        "data": response_content.get("data", []),
                        "visualization": response_content.get("visualization"),
                        "d3_config": response_content.get("d3_config")
                    },
                    "timestamp": datetime.now().isoformat()
                })

                # Convert entire conversation to JSON-serializable format
                chat.conversation = json.loads(
                    json.dumps(chat.conversation, cls=EnhancedJSONEncoder)
                )

                # Save changes
                db.add(chat)
                db.commit()

                return response_content

            except Exception as e:
                print(f"LLM Error: {str(e)}")
                raise Exception(f"Error in LLM interaction: {str(e)}")

        except Exception as e:
            print(f"Query Error: {str(e)}")
            raise Exception(f"Error processing chat: {str(e)}")

    def _is_data_query(self, message: str, schema_info: Dict[str, Any]) -> bool:
        """
        Determines if a message is likely a data query or just a conversation.
        
        Args:
            message: User message
            schema_info: Database schema information
            
        Returns:
            True if the message looks like a data query, False otherwise
        """
        # Simple heuristic for data queries
        data_keywords = [
            'data', 'query', 'table', 'database', 'sql', 'select', 'from', 'where',
            'group by', 'order by', 'count', 'sum', 'average', 'filter', 'join',
            'show me', 'find', 'list', 'display', 'report', 'analyze', 'statistic',
            'total', 'number of', 'how many', 'chart', 'graph', 'plot', 'visualize',
            'visualization', 'trend', 'compare', 'distribution', 'histogram', 'bar chart',
            'pie chart', 'line graph', 'scatter plot', 'd3', 'dashboard'
        ]
        
        # Add table names and columns from schema as data keywords
        if schema_info and 'schema' in schema_info:
            for table, info in schema_info['schema'].items():
                data_keywords.append(table.lower())
                if 'columns' in info:
                    for column in info['columns'].keys():
                        data_keywords.append(column.lower())
        
        # Check if message contains data query keywords
        message_lower = message.lower()
        
        # If the message is a greeting or very short, treat as conversation
        if len(message.split()) <= 2 and any(x in message_lower for x in ['hi', 'hello', 'hey']):
            return False
            
        # Check for data keywords
        return any(keyword in message_lower for keyword in data_keywords)

    def _call_llm(self, messages: List[Dict], tools: List[Dict]) -> Any:
        """Helper method to call LLM with error handling"""
        try:
            print(f"Calling Groq with model: llama-3.3-70b-versatile")
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                tools=tools,
                tool_choice="auto",
                temperature=0.2,  # Lower temperature for more deterministic tool use
                max_tokens=1024   # Ensure enough tokens for tool responses
            )
            print(f"Groq response received: {response.choices[0].message}")
            return response
        except Exception as e:
            print(f"Error calling Groq LLM: {str(e)}")
            raise

    def _get_tool_response(self, tool_call: Any, config: DatabaseConfig) -> Dict[str, Any]:
        """Execute tool call and return response"""
        try:
            args = json.loads(tool_call.function.arguments)
            return {
                "role": "tool",
                "tool_call_id": tool_call.id,
                "name": tool_call.function.name,
                "content": json.dumps(self._execute_query(config, args["query"]), cls=EnhancedJSONEncoder)
            }
        except Exception as e:
            return {
                "role": "tool",
                "tool_call_id": tool_call.id,
                "name": tool_call.function.name,
                "content": json.dumps({"error": str(e)})
            }

    def _build_system_message(self, config: DatabaseConfig, schema_info: Dict[str, Any]) -> str:
        # Only handle SQL databases (MySQL, PostgreSQL)
        if config.db_type not in ["mysql", "postgresql"]:
            raise ValueError(f"Unsupported database type: {config.db_type}")
            
        schema_str = "Database Schema:\n"
        for table_name, table_info in schema_info["schema"].items():
            schema_str += f"\nTable: {table_name}\n"
            for col_name, col_info in table_info["columns"].items():
                schema_str += f"- {col_name}: {col_info['type']}"
                if col_info.get("primary_key"):
                    schema_str += " (Primary Key)"
                schema_str += "\n"

        return (
            "You are a data analysis assistant with access to the following database schema:\n\n"
            f"{schema_str}\n\n"
            "When generating SQL queries:\n"
            "1. Only use tables and columns that exist in the schema\n"
            "2. Always use proper table aliases and explicit column references\n"
            "3. Include WHERE clauses to limit data when appropriate\n"
            "4. Before executing a query, explain your analysis plan\n"
            "5. Handle errors gracefully and suggest alternatives\n"
            "6. For aggregations, include relevant grouping and sorting\n"
            f"7. Use {config.db_type} compatible syntax\n"
            "8. Provide clear explanations of results\n\n"
            "You have one tool available:\n"
            "query_database - Use this to execute SQL queries and return structured results"
        )

    async def _execute_query(self, config: DatabaseConfig, query: str) -> Dict[str, Any]:
        """Execute query using database query endpoint"""
        try:
            # Only handle SQL databases (MySQL, PostgreSQL)
            if config.db_type not in ["mysql", "postgresql"]:
                raise Exception(f"Unsupported database type: {config.db_type}")
                
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"http://localhost:8000/api/v1/databases/query",
                    json={
                        "db_config_id": config.id,
                        "query": query
                    }
                )
                
                if response.status_code != 200:
                    raise Exception(f"Query execution failed: {response.text}")
                
                result = response.json()
                return {
                    "query_type": "sql",
                    "sql": query,
                    "columns": result.get("columns", []),
                    "data": result.get("data", []),
                    "total_rows": len(result.get("data", [])),
                    "data_types": result.get("data_types", {})
                }
        except Exception as e:
            raise Exception(f"Error executing query: {str(e)}")

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
import uuid
import os
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from ..config.r2_config import get_r2_client, R2_BUCKET_NAME
from ..auth.deps import get_current_user
import logging

router = APIRouter(tags=["file-upload"])

ALLOWED_EXTENSIONS = {'.csv', '.xlsx', '.xls'}
MAX_FILES = 5
MAX_SIZE = 100 * 1024 * 1024  # 100MB

@router.post("/upload/{username}")
async def upload_files(
    username: str,
    files: List[UploadFile] = File(...),
    current_user = Depends(get_current_user)
):
    try:
        # Get user ID directly from the user model
        user_id = str(current_user.id)  # Convert to string since it might be an integer
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication credentials"
            )
        
        # Verify username matches current user's username
        if username != current_user.username:
            raise HTTPException(
                status_code=403,
                detail="You can only upload files to your own directory"
            )

        if len(files) > MAX_FILES:
            raise HTTPException(
                status_code=400, 
                detail=f"Maximum {MAX_FILES} files allowed"
            )
        
        total_size = 0
        uploaded_files = []
        r2_client = get_r2_client()

        for file in files:
            try:
                # Check file extension
                _, ext = os.path.splitext(file.filename)
                if ext.lower() not in ALLOWED_EXTENSIONS:
                    raise HTTPException(
                        status_code=400,
                        detail=f"File {file.filename} has unsupported format. Allowed formats: CSV, Excel"
                    )
                
                # Read file content
                content = await file.read()
                total_size += len(content)
                
                if total_size > MAX_SIZE:
                    raise HTTPException(
                        status_code=400,
                        detail="Total upload size exceeds 100MB limit"
                    )
                
                # Reset file position after reading
                await file.seek(0)
                
                # Generate unique filename
                unique_filename = f"{user_id}/{uuid.uuid4()}{ext}"
                
                # Upload to R2
                r2_client.put_object(
                    Bucket=R2_BUCKET_NAME,
                    Key=unique_filename,
                    Body=content,
                    ContentType=file.content_type
                )
                
                uploaded_files.append({
                    "original_name": file.filename,
                    "stored_name": unique_filename
                })
            
            except Exception as file_error:
                logging.error(f"Error processing file {file.filename}: {str(file_error)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Error processing file {file.filename}: {str(file_error)}"
                )
        
        return {
            "message": "Files uploaded successfully",
            "uploaded_files": uploaded_files
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error(f"Upload error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

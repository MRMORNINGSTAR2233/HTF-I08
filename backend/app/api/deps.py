from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.auth.deps import get_current_user
from app.models.user import User

# Re-export the get_db dependency
get_db = get_db

# Re-export the get_current_user dependency
get_current_user = get_current_user
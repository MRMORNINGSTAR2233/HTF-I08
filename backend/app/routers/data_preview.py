from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ..utils.data_reader import DataReader
from ..schemas.preview import DataMetadata
from ..auth.deps import get_current_user
from ..api.deps import get_db

router = APIRouter(tags=["data-preview"])

@router.get("/preview/{db_config_id}", response_model=DataMetadata)
async def get_data_preview(
    db_config_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        preview_data = await DataReader.get_preview(db, db_config_id)
        return preview_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

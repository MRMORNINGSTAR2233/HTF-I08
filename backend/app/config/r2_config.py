import boto3

R2_BUCKET_NAME = "voi2viz"
R2_ENDPOINT_URL = "https://716806fb9ea5f2938036b1e3f8f7767b.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID = "dfd65fc847ed8fc1707396799e0f38fe"
R2_SECRET_ACCESS_KEY = "4fb9c47644317dcd26340d79eed4ddf25b1c5237286a6218f37278e334a3dbd1"

def get_r2_client():
    return boto3.client(
        's3',
        endpoint_url=R2_ENDPOINT_URL,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY
    )

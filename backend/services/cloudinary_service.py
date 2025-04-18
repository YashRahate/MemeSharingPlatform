import cloudinary.uploader
from flask import current_app

def upload_image(image_file, user_id):
    """
    Upload an image to Cloudinary.
    
    Args:
        image_file (FileStorage): The image file to upload
        user_id (str): The ID of the user uploading the image
        
    Returns:
        dict: The upload result containing URL, public_id, etc.
    """
    try:
        upload_result = cloudinary.uploader.upload(
            image_file,
            folder=f"meme_platform/users/{user_id}",
            resource_type="image"
        )
        return {
            'url': upload_result['secure_url'],
            'public_id': upload_result['public_id'],
            'width': upload_result['width'],
            'height': upload_result['height'],
            'format': upload_result['format']
        }
    except Exception as e:
        current_app.logger.error(f"Error uploading to Cloudinary: {str(e)}")
        raise

def delete_image(public_id):
    """
    Delete an image from Cloudinary by its public ID.
    
    Args:
        public_id (str): The public ID of the image
        
    Returns:
        bool: True if deletion was successful
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get('result') == 'ok'
    except Exception as e:
        current_app.logger.error(f"Error deleting from Cloudinary: {str(e)}")
        return False
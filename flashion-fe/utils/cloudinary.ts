export const uploadImageToCloudinary = async (imageURI:string, identifyFileName:string)=>{
    try{
        const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (cloudName === undefined || uploadPreset === undefined) {
            throw new Error("Cloudinary configuration is missing");
        }

        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const formData = new FormData();

        const fileType = imageURI.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `clothing_${identifyFileName}.${fileType}`;
        
        formData.append('file',{
            uri: imageURI,
            type: `image/${fileType}`,
            name: fileName
        } as any);

        formData.append('upload_preset', uploadPreset);

        formData.append('folder', 'flashion_app');

        formData.append('tags', 'flashion,app');

        formData.append('context', `upload_at=${new Date().toISOString()}`);

        const response = await fetch(url,{
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
            }
        });

        if(!response.ok){
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
        }

        const data = await response.json();

        return data.secure_url as string;
    }catch(error){
        throw new Error("Failed to upload image");
    }   
}

export const getOptimizedImageUrl = (originalUrl:string, width:number = 800, quality:string = 'auto' ):string =>{
    if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
        return originalUrl;
    }

    return originalUrl.replace(
        '/upload/',
        `/upload/w_${width},f_auto,q_${quality}/`
    )
}

export const getThumbnailUrl = (
    originalUrl:string,
    size:number = 300
):string =>{
    if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
        return originalUrl;
    }

    return originalUrl.replace(
        '/upload/',
        `/upload/w_${size},h_${size},c_fill,g_auto/`
    )

}

export const deleteImageFromCloudinary = async (publicId:string): Promise<boolean>=>{
    console.warn('⚠️ Delete image should be done from backend with API secret');
    throw new Error("Delete image from Cloudinary should be implemented on the backend for security reasons");
}
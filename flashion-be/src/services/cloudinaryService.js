const cloudinary = require('../config/cloudinary');

class CloudinaryService{
    async uploadImage(buffer){
        return new Promise((resolve, reject)=>{
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder:'flashion_app',
                    transformation:[
                        {quality:'auto'},
                        {fetch_format:'auto'}
                    ]
                },
                (error, result)=>{
                    if (error) reject(error);
                    else resolve(result);
                }
            )

            uploadStream.end(buffer)
        })
    }

    async deleteImage(publicId){
        return cloudinary.uploader.destroy(publicId);
    }
}

module.exports = new CloudinaryService();
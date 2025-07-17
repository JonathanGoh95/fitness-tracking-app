import coverImage from "../../images/cover_image.jpg"

export const BannerImage = () => {
    return (
        <div className="flex justify-center w-full h-40 overflow-hidden mb-4">
            <img className="w-full h-full object-cover rounded-md" src={coverImage} alt="Dashboard Banner"/>
        </div>
    )
}
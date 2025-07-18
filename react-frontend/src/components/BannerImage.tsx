import coverImage from "../../images/cover_image.jpg";

export const BannerImage = () => {
  return (
    <div className="mb-4 flex h-40 w-full justify-center overflow-hidden">
      <img
        className="h-full w-full rounded-md object-cover"
        src={coverImage}
        alt="Dashboard Banner"
      />
    </div>
  );
};

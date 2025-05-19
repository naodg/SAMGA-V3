import MapGallery from "./Mapgallery";
import StoreList from "./storelist";


export default function Mainthing() {
  return (
    <>
      <section>
        <MapGallery />
      </section>
      <section
        style={{
          marginTop: "-280px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <StoreList />
      </section>
    </>
  )
}

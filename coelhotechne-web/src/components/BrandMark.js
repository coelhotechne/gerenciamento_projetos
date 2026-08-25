import brandMark from "../assets/brand-mark.png";
 
export default function BrandMark({ size = 28 }) {
  return (
    <img
      src={brandMark}
      alt="Coelho Techne"
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}
 
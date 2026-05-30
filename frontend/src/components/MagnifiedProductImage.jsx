import { useState } from "react";

function MagnifiedProductImage({ src, alt }) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isActive, setIsActive] = useState(false);

  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    setPosition({
      x: Math.min(Math.max(x, 0), 100),
      y: Math.min(Math.max(y, 0), 100),
    });
  };

  return (
    <div
      className={`magnified-product-image ${isActive ? "is-active" : ""}`}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onMouseMove={handlePointerMove}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
      tabIndex={0}
      role="img"
      aria-label={`${alt}. Hover or focus to magnify.`}
      style={{
        "--magnify-x": `${position.x}%`,
        "--magnify-y": `${position.y}%`,
        "--magnify-image": `url("${src}")`,
      }}
    >
      <div className="magnified-product-stage">
        <img src={src} alt={alt} />
        <span className="magnify-lens" aria-hidden="true" />
        <span className="magnify-hint">Hover to zoom</span>
      </div>
      <div className="magnified-product-preview" aria-hidden="true">
        <span>Zoom preview</span>
      </div>
    </div>
  );
}

export default MagnifiedProductImage;

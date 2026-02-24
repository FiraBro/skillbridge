// apps/web/src/components/common/BrandLogo.jsx

export const BrandLogo = ({ as = "span" }) => {
  const Tag = as;

  return (
    <Tag className="brand-logo">
      SKILL<span>BRIDGE</span>
    </Tag>
  );
};

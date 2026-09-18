import React from "react";

interface LogoMarkProps {
  className?: string;
}

const LogoMark: React.FC<LogoMarkProps> = ({ className }) => (
  <svg className={`logo-mark ${className ?? ""}`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
    <circle className="logo-mark__badge" cx="20" cy="20" r="20" />
    <path className="logo-mark__glyph logo-mark__glyph--spine" pathLength={1} d="M16 10V30" />
    <path className="logo-mark__glyph logo-mark__glyph--top" pathLength={1} d="M16 10H27" />
    <path className="logo-mark__glyph logo-mark__glyph--mid" pathLength={1} d="M16 18H24" />
    <path className="logo-mark__glyph logo-mark__glyph--foot" pathLength={1} d="M12 30H20" />
  </svg>
);

export default LogoMark;

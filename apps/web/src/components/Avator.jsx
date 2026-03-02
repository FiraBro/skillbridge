import { memo } from "react";

/* ================= GET INITIALS ================= */
function getInitials(name = "") {
  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase();
  }

  return (
    (parts[0][0] || "") + (parts[parts.length - 1][0] || "")
  ).toUpperCase();
}

/* ================= STABLE COLOR ================= */
function stringToColor(str = "") {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "bg-blue-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-cyan-500",
  ];

  return colors[Math.abs(hash) % colors.length];
}

/* ================= AVATAR ================= */
function Avatar({ name, className = "" }) {
  const initials = getInitials(name);
  const bgColor = stringToColor(name);

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-semibold select-none ${bgColor} ${className}`}
    >
      {initials}
    </div>
  );
}

export default memo(Avatar);

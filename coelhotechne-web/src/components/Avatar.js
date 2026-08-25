import { initials, avatarColor } from "../utils/format";

export default function Avatar({ name, size = 30 }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.4 }}
    >
      {initials(name)}
    </span>
  );
}

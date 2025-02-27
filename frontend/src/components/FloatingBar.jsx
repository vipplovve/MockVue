import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FloatingBar = () => {
  const [hovered, setHovered] = useState(false);
  const nav = useNavigate();
  return (
    <div
    className={`fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-around bg-blue-900 text-white rounded-lg shadow-lg transition-all duration-500 ${hovered ? 'w-72' : 'w-64'} h-10`}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
  >  
      {icons.map((icon, index) => (
        <button
          key={index}
          onClick={()=>{nav(routes[index])}}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent transition-transform duration-300 hover:-translate-y-1"
        >
          {icon}
        </button>
      ))}
    </div>
  );
};

const routes = ["/", "/upload", "/profile", "/logout"];

const icons = [
    <svg
    className="h-6 w-6"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {" "}
    <path stroke="none" d="M0 0h24v24H0z" />{" "}
    <polyline points="5 12 3 12 12 3 21 12 19 12" />{" "}
    <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />{" "}
    <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
  </svg>
  ,
  <svg
  className="h-6 w-6"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth={2}
  strokeLinecap="round"
  strokeLinejoin="round"
>
  {" "}
  <polygon points="23 7 16 12 23 17 23 7" />{" "}
  <rect x={1} y={5} width={15} height={14} rx={2} ry={2} />
</svg>

,
<svg
  className="h-6 w-6"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth={2}
  strokeLinecap="round"
  strokeLinejoin="round"
>
  {" "}
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />{" "}
  <circle cx={12} cy={7} r={4} />
</svg>

,
  <svg
  className="h-6 w-6"
  width={24}
  height={24}
  viewBox="0 0 24 24"
  strokeWidth={2}
  stroke="currentColor"
  fill="none"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path stroke="none" d="M0 0h24v24H0z" />{" "}
  <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />{" "}
  <path d="M20 12h-13l3 -3m0 6l-3 -3" />
</svg>

];



export default FloatingBar;

import React from 'react';

const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962c.57-1.03-.19-2.27-.99-2.27a4.5 4.5 0 0 0-4.5 4.5v.552c0 .292.112.563.295.766a3.752 3.752 0 0 1 5.252-2.434M15 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

export default UserGroupIcon;

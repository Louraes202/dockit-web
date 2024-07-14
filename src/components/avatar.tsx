import Image from "next/image";

type Props = {
  userName?: string;
  userEmail?: string;
  onSignOut: () => void; // Adiciona a prop onSignOut
};
export const Avatar = ({
  userName = "Default User",
  userEmail = "user@example.com",
  onSignOut,
}: Props) => {
  return (
    <div className="relative">
      <div
        id="userDropdown"
        className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600 mt-4 mr-1"
      >
        <div className="px-4 py-3">
          <span className="block text-sm text-gray-900 dark:text-white break-words">
            {userName}
          </span>
          <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 break-words">
            {userEmail}
          </span>
        </div>
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="avatarButton"
        >
          <li>
            <a
              href="#"
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Profile
            </a>
          </li>
          <li>
            <a
              href="#"
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Settings
            </a>
          </li>
        </ul>
        <div className="py-1">
          <a
            onClick={onSignOut}
            href="#"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
          >
            Sign out
          </a>
        </div>
      </div>
    </div>
  );
};
